export interface Notification {
  id: string;
  username: string;
  avatar: string;
  message: string;
  link?: string;
  read: boolean;
}
