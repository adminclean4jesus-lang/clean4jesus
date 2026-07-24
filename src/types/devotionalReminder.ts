export type DevotionalReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
  scheduledNotificationId: string | null;
};

export type DevotionalReminderTarget =
  | {
      kind: "plan";
      activePlanCount: number;
      body: string;
      day: number;
      dayTitle: string;
      missedDays: number;
      planId: string;
      route: string;
      subtitle: string;
      title: string;
    }
  | {
      kind: "daily";
      activePlanCount: number;
      body: string;
      route: string;
      subtitle: string;
      title: string;
    };
