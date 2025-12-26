/**
 * Metrics Utility
 * 
 * Simple utility to emit metrics as per SC-008.
 * In a production environment, this would integrate with Prometheus, CloudWatch, or a similar service.
 */

export const emitMetric = (name: string, value: any, tags: Record<string, string> = {}) => {
  const timestamp = new Date().toISOString();
  const tagString = Object.entries(tags)
    .map(([key, val]) => `${key}:${val}`)
    .join(', ');
  
  // For now, we log metrics to console in a structured format
  // This can be picked up by log aggregators
  console.log(`[METRIC] ${timestamp} | ${name}: ${value} | [${tagString}]`);
};

export const Metrics = {
  // Quiz Metrics
  QUIZ_CREATED: 'quiz.created',
  QUIZ_ATTEMPTED: 'quiz.attempt',
  QUIZ_SCORE: 'quiz.score',
  
  // General API Metrics
  API_ERROR: 'api.error',
  API_SUCCESS: 'api.success',
};
