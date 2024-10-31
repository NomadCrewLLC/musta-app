export interface ScheduledTimeConfig {
    [time: number]: scheduledHourProps;
  }
export type scheduledHourProps = {
    isEnabled: boolean;
    notificationID: string | null;
  };

  export interface SelectedItemProps {
    isEnabled: boolean,
    id: number,
    time: string
  }
  