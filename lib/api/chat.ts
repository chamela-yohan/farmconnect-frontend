// lib/api/chat.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ConversationSummaryResponse, MessageResponse } from '@/types/chat';

// FETCH INBOX
export const useMyConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      //  Points to /chat (which resolves to /api/v1/chat)
      const { data } = await api.get('/chat');
      return data.data as ConversationSummaryResponse[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

//  FETCH CHAT HISTORY
export const useChatHistory = (conversationId: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: ['chatHistory', conversationId],
    queryFn: async () => {
      //  Points to /chat/{id}/messages
      const { data } = await api.get(`/chat/${conversationId}/messages?size=50`);
      return data.data.content as MessageResponse[];
    },
    enabled: !!conversationId && enabled,
  });
};

//  MARK AS READ
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      //  Points to /chat/{id}/read
      await api.put(`/chat/${conversationId}/read`);
    },
    onSuccess: (_, conversationId) => {
      // Invalidate conversations to update unread counts in the inbox
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

//  GET CONVERSATION BY ORDER
export const useConversationByOrder = (orderId: string | null) => {
  return useQuery<string | null>({
    queryKey: ['conversation', 'order', orderId],
    queryFn: async (): Promise<string | null> => {
      if (!orderId) return null;
      
      try {
        const response = await api.get(`/chat/order/${orderId}/conversation`);
        // Safely extract the data, explicitly defaulting to null if undefined
        const result = response?.data?.data;
        return result !== undefined ? (result as string) : null;
      } catch (error) {
        // If the endpoint returns 404/500 or the conversation doesn't exist yet, return null
        console.warn("No conversation found for order:", orderId);
        return null; 
      }
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get Conversation ID by Booking
export const useConversationByBooking = (bookingId: string | null) => {
  return useQuery<string | null>({
    queryKey: ['conversation', 'booking', bookingId],
    queryFn: async (): Promise<string | null> => {
      if (!bookingId) return null;
      
      try {
        const response = await api.get(`/chat/booking/${bookingId}/conversation`);
        // Safely extract the data, explicitly defaulting to null if undefined
        const result = response?.data?.data;
        return result !== undefined ? (result as string) : null;
      } catch (error) {
        // If the endpoint returns 404/500 or the conversation doesn't exist yet, return null
        console.warn("No conversation found for booking:", bookingId);
        return null;
      }
    },
    enabled: !!bookingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};