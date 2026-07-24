export type DevotionalPlanDay = {
  day: number;
  title: string;
  verse: string;
  reference: string;
  reflection: string;
  question: string;
  prayer: string;
  practice: string;
};

export type DevotionalPlan = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tone: "primary" | "accent" | "success";
  icon: string;
  days: DevotionalPlanDay[];
};

export type DevotionalPlanDayTitle = Pick<DevotionalPlanDay, "day" | "title">;

export type DevotionalPlanSummary = Omit<DevotionalPlan, "days"> & {
  dayCount: number;
  dayTitles: DevotionalPlanDayTitle[];
};

export type DevotionalPlanEnrollment = {
  planId: string;
  startedAt: string;
  completedDays: number[];
};

export type DevotionalPlanProgress = Record<string, DevotionalPlanEnrollment>;
