import { metersBetween } from './geo.mjs';

const SIMILAR_DISTANCE_METERS = 200;
const SIMILAR_WINDOW_MS = 30 * 60 * 1000;

export function findNearbySimilar(reports, newReport) {
  if (!Array.isArray(reports) || !newReport) {
    return 0;
  }

  const targetCategories = Array.isArray(newReport.categories) ? newReport.categories : [];
  if (targetCategories.length === 0) {
    return 0;
  }

  const targetTime = new Date(newReport.createdAt).getTime();
  if (Number.isNaN(targetTime)) {
    return 0;
  }

  return reports.filter(report => {
    if (!report || typeof report !== 'object') {
      return false;
    }

    const reportTime = new Date(report.createdAt).getTime();
    if (Number.isNaN(reportTime) || targetTime - reportTime > SIMILAR_WINDOW_MS) {
      return false;
    }

    const reportCategories = Array.isArray(report.categories) ? report.categories : [];
    const overlapsCategory = reportCategories.some(category => targetCategories.includes(category));
    if (!overlapsCategory) {
      return false;
    }

    const distance = metersBetween(report.lat, report.lng, newReport.lat, newReport.lng);
    return distance <= SIMILAR_DISTANCE_METERS;
  }).length;
}
