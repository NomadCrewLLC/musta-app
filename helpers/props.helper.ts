export interface NotificationTimeProps {
  isEnabled: boolean;
  isCustom: boolean;
  id: number;
  time: string | Date;
  notificationID: string | null;
}
