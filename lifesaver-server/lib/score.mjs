const ANSWER_FIELDS = ['breathing', 'bleeding', 'trapped', 'water', 'fire', 'vulnerable', 'alone'];

const URGENCY_THRESHOLDS = [
  { min: 12, label: 'critical' },
  { min: 8, label: 'high' },
  { min: 5, label: 'medium' },
  { min: 0, label: 'low' }
];

export function scoreReport(answers, nearbySimilarCount, hasContact) {
  const safeAnswers = ANSWER_FIELDS.reduce((acc, key) => {
    acc[key] = Boolean(answers?.[key]);
    return acc;
  }, {});

  let score = 0;

  if (safeAnswers.breathing) score += 4;
  if (safeAnswers.bleeding) score += 4;
  if (safeAnswers.trapped) score += 3;
  if (safeAnswers.water) score += 3;
  if (safeAnswers.fire) score += 3;
  if (safeAnswers.vulnerable) score += 2;
  if (safeAnswers.alone) score += 1;
  if (!hasContact) score += 1;
  if (nearbySimilarCount >= 2) score += 2;

  const urgency = URGENCY_THRESHOLDS.find(threshold => score >= threshold.min)?.label ?? 'low';

  return { score, urgency };
}
