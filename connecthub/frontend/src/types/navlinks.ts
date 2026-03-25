export type NavLink = {
  name: string;
  emoji: string;
  link?: string;
}[];

export type NotificationPanelType = "messages" | "classified" | null;

export type NotificationItem = {
  id?: number | string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
};
