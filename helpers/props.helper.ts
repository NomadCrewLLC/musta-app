export interface ScheduledTimeConfig {
    [time: number]: scheduledHourProps;
  }
export type scheduledHourProps = {
    isEnabled: boolean;
    notificationID: string | null;
  };

  export interface NotificationTimeProps {
    isEnabled: boolean,
    isCustom: boolean,
    id: number,
    time: Date,
    notificationID: string | null;
  }
  