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
  return useQuery({
    queryKey: ['conversation', 'order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      // This was already correct, kept for consistency
      const { data } = await api.get(`/chat/order/${orderId}/conversation`);
      return data.data as string | null;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
  });
};