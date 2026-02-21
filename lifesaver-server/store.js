import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'db.json');

const DEFAULT_DB = { reports: [] };

async function ensureStore() {
  try {
    await access(DATA_DIR);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await access(DATA_FILE);
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
  }
}

async function readDatabase() {
  await ensureStore();
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_DB };
    }
    if (!Array.isArray(parsed.reports)) {
      return { ...parsed, reports: [] };
    }
    return parsed;
  } catch (error) {
    console.error('Failed to read database, resetting to default.', error);
    await writeDatabase(DEFAULT_DB);
    return { ...DEFAULT_DB };
  }
}

async function writeDatabase(data) {
  await ensureStore();
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function listReports() {
  const data = await readDatabase();
  return Array.isArray(data.reports) ? data.reports : [];
}

export async function getReportById(id) {
  const reports = await listReports();
  return reports.find(report => report.id === id) ?? null;
}

export async function addReport(report) {
  const reports = await listReports();
  reports.push(report);
  await writeDatabase({ reports });
  return report;
}

export async function updateReport(id, updates) {
  const reports = await listReports();
  const index = reports.findIndex(report => report.id === id);

  if (index === -1) {
    return null;
  }

  const updated = { ...reports[index], ...updates };
  reports[index] = updated;
  await writeDatabase({ reports });
  return updated;
}
