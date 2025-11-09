import type { Answers, Urgency } from '../types.ts';

const URGENCY_THRESHOLDS: { min: number; label: Urgency }[] = [
  { min: 12, label: 'critical' },
  { min: 8, label: 'high' },
  { min: 5, label: 'medium' },
  { min: 0, label: 'low' }
];

export function scoreReport(answers: Answers, hasContact: boolean) {
  const safeAnswers: Answers = {
    breathing: Boolean(answers?.breathing),
    bleeding: Boolean(answers?.bleeding),
    trapped: Boolean(answers?.trapped),
    water: Boolean(answers?.water),
    fire: Boolean(answers?.fire),
    vulnerable: Boolean(answers?.vulnerable),
    alone: Boolean(answers?.alone)
  };

  let score = 0;

  if (safeAnswers.breathing) score += 4;
  if (safeAnswers.bleeding) score += 4;
  if (safeAnswers.trapped) score += 3;
  if (safeAnswers.water) score += 3;
  if (safeAnswers.fire) score += 3;
  if (safeAnswers.vulnerable) score += 2;
  if (safeAnswers.alone) score += 1;
  if (!hasContact) score += 1;

  const urgency =
    URGENCY_THRESHOLDS.find(threshold => score >= threshold.min)?.label ?? 'low';

  return { score, urgency };
}
