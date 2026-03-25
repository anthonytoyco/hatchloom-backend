export type FeedItem = {
  id: string;
  hasUnread: boolean;
  avatar: string;
  avatarBgClass: string;
  name: string;
  channel: string;
  text: string;
  time: string;
};

export type itemTypes = {
  id: string;
  title: string;
  emoji: string;
  type: string;
  typeClass: string;
};

export type SecondaryCardProps = {
  title: string;
  icon: string;
  iconBackground: string;
  linkText: string;
  items: itemTypes[];
};
