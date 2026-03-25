/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, createContext, type SetStateAction } from "react";

export type ConnecthubContextType = {
  classifiedNotifications: any[];
  classifiedUnreadCount: number;
  messageNotifications: any[];
  messageUnreadCount: number;
  totalUnreadCount: number;
  setClassifiedNotifications: React.Dispatch<SetStateAction<any[]>>;
  setClassifiedUnreadCount: React.Dispatch<SetStateAction<number>>;
  setMessageNotifications: React.Dispatch<SetStateAction<any[]>>;
  setMessageUnreadCount: React.Dispatch<SetStateAction<number>>;
  setTotalUnreadCount: React.Dispatch<SetStateAction<number>>;
  isSubscribedToClassified: boolean;
  setIsSubscribedToClassified: React.Dispatch<SetStateAction<boolean>>;
};

export const ConnecthubContext = createContext<ConnecthubContextType>({
  classifiedNotifications: [],
  classifiedUnreadCount: 0,
  messageNotifications: [],
  messageUnreadCount: 0,
  totalUnreadCount: 0,
  isSubscribedToClassified: false,
  setClassifiedNotifications: () => {},
  setClassifiedUnreadCount: () => {},
  setMessageNotifications: () => {},
  setMessageUnreadCount: () => {},
  setTotalUnreadCount: () => {},
  setIsSubscribedToClassified: () => {},
});

export const useConnecthubContext = () => useContext(ConnecthubContext);
