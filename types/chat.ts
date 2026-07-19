// types
export interface ConversationSummaryResponse {
  conversationId: string;
  orderNumber: string | null;
  bookingId: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUserProfilePicture: string | null;
  lastMessagePreview: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}