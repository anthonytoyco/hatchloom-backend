export type ConversationSummary = {
  id: string;
  otherUserId: string;
  createdAt: string;
};

export type ConversationMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};
