// hooks/useChatSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageResponse } from '@/types/chat';

export const useChatSocket = (conversationId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setError('No authentication token found');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const client = new Client({
      webSocketFactory: () => new SockJS(`${apiUrl}/ws-chat`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ WebSocket Connected!');
      setIsConnected(true);
      setError(null);

      setMessages([]);
      
      client.subscribe(`/topic/chat.${conversationId}`, (message: IMessage) => {
        console.log('📩 Received message:', message.body);
        const newMessage = JSON.parse(message.body) as MessageResponse;
        
        // ✅ Only add if it doesn't already exist (prevent duplicates)
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP Error:', frame.headers['message']);
      setError('Failed to connect to chat server');
      setIsConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log(' WebSocket Closed');
      setIsConnected(false);
    };

    client.onWebSocketError = (event) => {
      console.error(' WebSocket Error:', event);
      setError('WebSocket connection failed');
    };

    console.log('🔌 Attempting to connect to WebSocket...');
    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        console.log('🔌 Deactivating WebSocket...');
        clientRef.current.deactivate();
      }
    };
  }, [conversationId]);

  const sendMessage = useCallback((content: string) => {
    if (clientRef.current && clientRef.current.connected && conversationId) {
      console.log('📤 Sending message:', content);
      clientRef.current.publish({
        destination: `/app/chat.send/${conversationId}`,
        body: JSON.stringify({ content }),
      });
    }
  }, [conversationId]);

  return { messages, sendMessage, isConnected, error, setMessages };
};