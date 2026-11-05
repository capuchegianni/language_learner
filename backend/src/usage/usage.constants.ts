import { ActionType, Plan } from '../generated/prisma/client';

export { ActionType, Plan };
export type PlanType = Plan;

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  [ActionType.RULE_PROPOSAL]: 'rule proposals',
  [ActionType.LESSON_GENERATION]: 'lesson generations',
  [ActionType.LESSON_CORRECTION]: 'lesson corrections',
};

export const PLAN_LIMITS: Record<Plan, Record<ActionType, number>> = {
  [Plan.FREE]: {
    [ActionType.RULE_PROPOSAL]: 3,
    [ActionType.LESSON_GENERATION]: 2,
    [ActionType.LESSON_CORRECTION]: 2,
  },
  [Plan.PREMIUM]: {
    [ActionType.RULE_PROPOSAL]: 10,
    [ActionType.LESSON_GENERATION]: 7,
    [ActionType.LESSON_CORRECTION]: 7,
  },
};

export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

export const PLAN_MODELS: Record<Plan, Record<ActionType, string>> = {
  [Plan.FREE]: {
    [ActionType.RULE_PROPOSAL]: 'gemini-3.5-flash-lite',
    [ActionType.LESSON_GENERATION]: 'gemini-3.6-flash',
    [ActionType.LESSON_CORRECTION]: 'gemini-3.6-flash',
  },
  [Plan.PREMIUM]: {
    [ActionType.RULE_PROPOSAL]: 'gemini-3.5-flash-lite',
    [ActionType.LESSON_GENERATION]: 'gemini-3.8-flash',
    [ActionType.LESSON_CORRECTION]: 'gemini-3.8-flash',
  },
};

