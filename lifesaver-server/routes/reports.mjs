import { Router } from 'express';
import { v4 as uuid } from 'uuid';

import { findNearbySimilar } from '../lib/reports.mjs';
import { geohashFor } from '../lib/geo.mjs';
import { scoreReport } from '../lib/score.mjs';
import { addReport, getReportById, listReports, updateReport } from '../store.js';

const ANSWER_FIELDS = ['breathing', 'bleeding', 'trapped', 'water', 'fire', 'vulnerable', 'alone'];
const STATUS_VALUES = ['new', 'ack', 'enroute', 'resolved'];
const URGENCY_VALUES = ['low', 'medium', 'high', 'critical'];

const CATEGORY_QUERY_KEYS = ['category', 'categories', 'category[]', 'categories[]'];

function parseStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap(item =>
        typeof item === 'string' && item.includes(',') ? item.split(',') : [item]
      )
      .map(item => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Ignore JSON parse errors, fall back to comma-separated parsing.
    }
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseAnswers(body) {
  let structuredAnswers = body?.answers;
  if (typeof structuredAnswers === 'string') {
    try {
      structuredAnswers = JSON.parse(structuredAnswers);
    } catch {
      structuredAnswers = undefined;
    }
  }

  const answers = ANSWER_FIELDS.reduce((acc, key) => {
    const nestedKeys = [
      `answers[${key}]`,
      `answers.${key}`,
      `answers_${key}`
    ];

    let value;
    if (body && typeof body === 'object') {
      if (structuredAnswers && typeof structuredAnswers === 'object') {
        value = structuredAnswers[key];
      }
      for (const nestedKey of nestedKeys) {
        if (nestedKey in body) {
          value = body[nestedKey];
          break;
        }
      }
    }

    if (typeof value === 'string') {
      acc[key] = value === 'true' || value === '1' || value.toLowerCase() === 'on';
    } else if (typeof value === 'number') {
      acc[key] = value === 1;
    } else {
      acc[key] = Boolean(value);
    }

    return acc;
  }, {});

  return answers;
}

function parseReportBody(req) {
  const { body } = req;

  const lat = Number.parseFloat(body?.lat ?? body?.latitude);
  const lng = Number.parseFloat(body?.lng ?? body?.lon ?? body?.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('Invalid coordinates.');
  }

  const categories = CATEGORY_QUERY_KEYS.reduce((acc, key) => {
    if (key in (body ?? {})) {
      acc.push(...parseStringArray(body[key]));
    }
    return acc;
  }, parseStringArray(body?.categories ?? body?.category));

  const uniqueCategories = [...new Set(categories.map(category => category.toLowerCase()))];

  const answers = parseAnswers(body);

  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const contactRaw = typeof body?.contact === 'string' ? body.contact.trim() : '';
  const photoUrl = typeof body?.photoUrl === 'string' ? body.photoUrl.trim() : '';

  return {
    lat,
    lng,
    categories: uniqueCategories,
    answers,
    text,
    contact: contactRaw || null,
    photoUrl: photoUrl || null
  };
}

function normaliseQueryParam(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap(item => String(item).split(','))
      .map(item => item.trim().toLowerCase())
      .filter(Boolean);
  }
  return String(value)
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

function createMaybeUploadMiddleware(upload) {
  return (req, res, next) => {
    if (req.is('multipart/form-data')) {
      upload.single('photo')(req, res, next);
    } else {
      next();
    }
  };
}

export default function createReportsRouter({ upload, rateLimitMiddleware }) {
  const router = Router();
  const maybeUpload = createMaybeUploadMiddleware(upload);

  router.get('/', async (req, res, next) => {
    try {
      const { category, categories, urgency, status } = req.query;
      const categoryFilters = [category, categories]
        .flat()
        .filter(Boolean)
        .flatMap(value => normaliseQueryParam(value));
      const urgencyFilters = normaliseQueryParam(urgency).filter(value => URGENCY_VALUES.includes(value));
      const statusFilters = normaliseQueryParam(status).filter(value => STATUS_VALUES.includes(value));

      const reports = await listReports();
      const filtered = reports
        .filter(report => {
          if (categoryFilters.length > 0) {
            const reportCategories = Array.isArray(report.categories) ? report.categories : [];
            const matchesCategory = reportCategories.some(category =>
              categoryFilters.includes(category)
            );
            if (!matchesCategory) {
              return false;
            }
          }

          if (urgencyFilters.length > 0 && !urgencyFilters.includes(report.urgency)) {
            return false;
          }

          if (statusFilters.length > 0 && !statusFilters.includes(report.status)) {
            return false;
          }

          return true;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(filtered);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const report = await getReportById(req.params.id);
      if (!report) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      res.json(report);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', rateLimitMiddleware, maybeUpload, async (req, res, next) => {
    try {
      const parsed = parseReportBody(req);
      const createdAt = new Date().toISOString();
      const newReport = {
        id: uuid(),
        createdAt,
        updatedAt: createdAt,
        lat: parsed.lat,
        lng: parsed.lng,
        geohash: geohashFor(parsed.lat, parsed.lng),
        categories: parsed.categories,
        answers: ANSWER_FIELDS.reduce((acc, key) => {
          acc[key] = Boolean(parsed.answers[key]);
          return acc;
        }, {}),
        text: parsed.text,
        contact: parsed.contact,
        photoUrl: req.file
          ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
          : parsed.photoUrl,
        status: 'new',
        assignedTo: null,
        duplicateOf: null
      };

      const existingReports = await listReports();
      const nearbySimilarCount = findNearbySimilar(existingReports, newReport);
      const { score, urgency } = scoreReport(newReport.answers, nearbySimilarCount, Boolean(newReport.contact));

      newReport.score = score;
      newReport.urgency = urgency;

      await addReport(newReport);

      res.status(201).json(newReport);
    } catch (error) {
      if (error.message === 'Invalid coordinates.') {
        res.status(400).json({ error: 'invalid_coordinates' });
        return;
      }
      next(error);
    }
  });

  router.patch('/:id', async (req, res, next) => {
    try {
      const report = await getReportById(req.params.id);
      if (!report) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      const updates = {};
      if (req.body.status !== undefined) {
        if (!STATUS_VALUES.includes(req.body.status)) {
          res.status(400).json({ error: 'invalid_status' });
          return;
        }
        updates.status = req.body.status;
      }

      if (req.body.assignedTo !== undefined) {
        if (req.body.assignedTo === null || req.body.assignedTo === '') {
          updates.assignedTo = null;
        } else if (typeof req.body.assignedTo === 'string') {
          updates.assignedTo = req.body.assignedTo;
        } else {
          res.status(400).json({ error: 'invalid_assigned_to' });
          return;
        }
      }

      if (req.body.text !== undefined) {
        if (typeof req.body.text !== 'string') {
          res.status(400).json({ error: 'invalid_text' });
          return;
        }
        updates.text = req.body.text;
      }

      if (Object.keys(updates).length === 0) {
        res.json(report);
        return;
      }

      updates.updatedAt = new Date().toISOString();

      const updated = await updateReport(report.id, updates);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
