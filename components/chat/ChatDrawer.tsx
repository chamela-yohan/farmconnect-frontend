"use client";

import { useState, useEffect, useRef } from "react";
import { useMyConversations, useChatHistory, useMarkAsRead } from "@/lib/api/chat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { X, Send, MessageSquare, Loader2, User } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore"; 
import React from "react";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialConversationId?: string | null; // To open directly to a chat from an order page
}

export function ChatDrawer({ isOpen, onClose, initialConversationId }: ChatDrawerProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore(); // Get current user ID to determine "me" vs "other"
  const { data: conversations, isLoading: isLoadingConversations } = useMyConversations();
  const { data: history, isLoading: isLoadingHistory } = useChatHistory(selectedConversationId, isOpen);
  const markAsReadMutation = useMarkAsRead();

  // Initialize WebSocket only when a conversation is selected and drawer is open
  const { messages: wsMessages, sendMessage, isConnected, setMessages } = useChatSocket(selectedConversationId);

  // Combine REST history and WebSocket messages
  const allMessages = React.useMemo(() => {
  if (!history || history.length === 0) return wsMessages;
  if (wsMessages.length === 0) return history;
  
  // Create a Set of message IDs from history to avoid duplicates
  const historyIds = new Set(history.map(msg => msg.id));
  
  // Only add WebSocket messages that aren't already in history
  const newWsMessages = wsMessages.filter(msg => !historyIds.has(msg.id));
  
  return [...history, ...newWsMessages];
}, [history, wsMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (selectedConversationId && isOpen) {
      markAsReadMutation.mutate(selectedConversationId);
    }
  }, [selectedConversationId, isOpen]);

  // Reset WS messages when changing conversations to prevent message bleed
  useEffect(() => {
    setMessages([]);
  }, [selectedConversationId, setMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;
    
    sendMessage(newMessage.trim());
    setNewMessage("");
  };

  const selectedConversation = conversations?.find(c => c.conversationId === selectedConversationId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-background border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          {selectedConversation ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button onClick={() => setSelectedConversationId(null)} className="p-1 hover:bg-muted rounded-full">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="relative w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                {selectedConversation.otherUserProfilePicture ? (
                  <Image src={selectedConversation.otherUserProfilePicture} alt="Profile" fill className="object-cover" />
                ) : (
                  <User className="w-5 h-5 text-primary m-1.5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{selectedConversation.otherUserName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {isConnected ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Messages
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-muted/10">
          {!selectedConversation ? (
            // Inbox List
            isLoadingConversations ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : conversations && conversations.length > 0 ? (
              <div className="divide-y divide-border">
                {conversations.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => setSelectedConversationId(conv.conversationId)}
                    className="w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="relative w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                      {conv.otherUserProfilePicture ? (
                        <Image src={conv.otherUserProfilePicture} alt="Profile" fill className="object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-primary m-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold text-foreground truncate">{conv.otherUserName}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.lastMessageTime).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {conv.lastMessagePreview}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full mt-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                <p>No conversations yet.</p>
                <p className="text-sm mt-1">Messages will appear here when you interact with farmers or buyers.</p>
              </div>
            )
          ) : (
            // Active Chat Window
            <div className="flex flex-col h-full">
              {isLoadingHistory ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {allMessages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-muted text-foreground rounded-bl-sm border border-border'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-3 border-t border-border bg-background flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isConnected ? "Type a message..." : "Connecting..."}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-2 bg-muted border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !newMessage.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}