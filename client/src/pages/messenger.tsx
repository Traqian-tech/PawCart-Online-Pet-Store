import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft, Smile, Package, Truck, HelpCircle, CreditCard, Bot, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getProductSlug } from '@/lib/slug-utils';
import { useAuth } from '@/hooks/use-auth';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support' | 'ai';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  products?: any[];
}

interface QuickReply {
  id: string;
  text: string;
  icon?: React.ReactNode;
}

interface ChatHistoryMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const quickReplies: QuickReply[] = [
  { id: '1', text: 'Cat food recommendations?', icon: <Package className="w-4 h-4" /> },
  { id: '2', text: 'Shipping information', icon: <Truck className="w-4 h-4" /> },
  { id: '3', text: 'Return policy', icon: <HelpCircle className="w-4 h-4" /> },
  { id: '4', text: 'Payment methods', icon: <CreditCard className="w-4 h-4" /> },
  { id: '5', text: 'Product recommendations', icon: <HelpCircle className="w-4 h-4" /> },
  { id: '6', text: 'Speak to agent', icon: <Phone className="w-4 h-4" /> }
];

const autoResponses: { [key: string]: string } = {
  'track my order': 'You can track your order by visiting our Track Order page or using the tracking number sent to your email. Would you like me to help you find your order?',
  'shipping information': 'We offer Standard (3-5 days), Express (1-2 days), and Same-Day delivery. Free shipping on orders over HK$300! What would you like to know about shipping?',
  'return policy': 'We accept returns of unopened items within 7 days of delivery. Items must be in original packaging. Would you like to start a return?',
  'payment methods': 'We accept Credit/Debit Cards, PayPal, Apple Pay, Google Pay, and Bank Transfer. All payments are secure. Do you have a specific payment question?',
  'product recommendations': 'I\'d be happy to help! What type of pet do you have, and what are you looking for? (Food, toys, accessories, etc.)',
  'speak to agent': 'Connecting you to a live agent... Our team typically responds within 2 minutes during business hours (10 AM - 10 PM HKT).'
};

export default function MessengerPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<ChatHistoryMessage[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session and load history messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoadingHistory(true);
        
        // Try to restore sessionId from localStorage
        const storedSessionId = safeGetItem('chat_session_id');
        
        // Get or create session
        const sessionResponse = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user?.id || user?._id,
            sessionId: storedSessionId || undefined
          })
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSessionId(sessionData.sessionId);
          setConversationId(sessionData.conversationId);
          
          // Save sessionId to localStorage
          safeSetItem('chat_session_id', sessionData.sessionId);

          // Load history messages
          const messagesResponse = await fetch(
            `/api/chat/messages?sessionId=${sessionData.sessionId}`
          );

          if (messagesResponse.ok) {
            const { messages: historyMessages } = await messagesResponse.json();
            
            if (historyMessages && historyMessages.length > 0) {
              // Convert database message format to frontend format
              const formattedMessages: Message[] = historyMessages.map((msg: any) => ({
                id: msg._id || msg.id,
                text: msg.text,
                sender: msg.sender,
                timestamp: new Date(msg.timestamp || msg.createdAt),
                status: msg.status || 'delivered',
                products: msg.products || []
              }));

              // Rebuild conversation history (for AI context)
              const history: ChatHistoryMessage[] = [];
              formattedMessages.forEach((msg) => {
                if (msg.sender === 'user') {
                  history.push({ role: 'user', content: msg.text });
                } else if (msg.sender === 'ai') {
                  history.push({ role: 'assistant', content: msg.text });
                }
              });
              setConversationHistory(history);

              setMessages(formattedMessages);
              setShowQuickReplies(formattedMessages.length <= 2);
            } else {
              // No history messages, show welcome message
              const welcomeMessage: Message = {
                id: 'welcome',
                text: 'Hello! Welcome to PawCart Pet Shop! 🐾\n\nI\'m your AI customer service assistant, and I can help you with:\n• 🔍 Product inquiries and recommendations\n• 💰 Prices and special offers\n• 🚚 Shipping and delivery services\n• 📱 Store information\n\nHow can I assist you today?',
                sender: 'ai',
                timestamp: new Date(),
                status: 'delivered'
              };
              setMessages([welcomeMessage]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        // Show welcome message on failure
        const welcomeMessage: Message = {
          id: 'welcome',
          text: 'Hello! Welcome to PawCart Pet Shop! 🐾\n\nI\'m your AI customer service assistant, and I can help you with:\n• 🔍 Product inquiries and recommendations\n• 💰 Prices and special offers\n• 🚚 Shipping and delivery services\n• 📱 Store information\n\nHow can I assist you today?',
          sender: 'ai',
          timestamp: new Date(),
          status: 'delivered'
        };
        setMessages([welcomeMessage]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    initializeChat();
  }, [user]);

  // Save message to database
  const saveMessage = async (message: Message) => {
    if (!conversationId || !sessionId) return;

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          sessionId,
          userId: user?.id || user?._id,
          text: message.text,
          sender: message.sender,
          status: message.status || 'sent',
          products: message.products || []
        })
      });
    } catch (error) {
      console.error('Failed to save message:', error);
      // Don't block user from continuing, fail silently
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || newMessage;
    if (textToSend.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: textToSend,
        sender: 'user',
        timestamp: new Date(),
        status: 'sent'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setShowQuickReplies(false);
      
      // Save user message to database
      await saveMessage(userMessage);
      
      // Update conversation history
      const newHistory: ChatHistoryMessage[] = [
        ...conversationHistory,
        { role: 'user', content: textToSend }
      ];
      
      if (isAiEnabled) {
        // Call AI API
        setIsTyping(true);
        
        try {
          const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: textToSend,
              conversationHistory: newHistory
            })
          });

          if (!response.ok) {
            throw new Error('AI service response failed');
          }

          const data = await response.json();
          
          setIsTyping(false);
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.response,
            sender: 'ai',
            timestamp: new Date(),
            status: 'delivered',
            products: data.products || []
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          // Save AI reply to database
          await saveMessage(aiMessage);
          
          // Update conversation history
          setConversationHistory([
            ...newHistory,
            { role: 'assistant', content: data.response }
          ]);
          
        } catch (error) {
          console.error('AI chat error:', error);
          setIsTyping(false);
          
          // Fallback to rule engine
          const lowerText = textToSend.toLowerCase();
          let responseText = 'Sorry, the AI service is temporarily unavailable. Our customer service team will respond to you shortly.\n\nYou can also call us directly: 852-6214-6811\nBusiness hours: Daily 10:00 AM - 10:00 PM';
          
          // Find matching auto-response
          for (const [key, value] of Object.entries(autoResponses)) {
            if (lowerText.includes(key)) {
              responseText = value;
              break;
            }
          }
          
          const fallbackMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'support',
            timestamp: new Date(),
            status: 'delivered'
          };
          setMessages(prev => [...prev, fallbackMessage]);
          
          // Save fallback message to database
          await saveMessage(fallbackMessage);
          
          toast({
            title: "Notice",
            description: "AI service temporarily unavailable, switched to auto-reply mode",
            variant: "default"
          });
        }
      } else {
        // Use rule-based responses
        setIsTyping(true);
        setTimeout(async () => {
          const lowerText = textToSend.toLowerCase();
          let responseText = 'Thank you for your message! Our customer service team will get back to you shortly.';
          
          for (const [key, value] of Object.entries(autoResponses)) {
            if (lowerText.includes(key)) {
              responseText = value;
              break;
            }
          }
          
          setIsTyping(false);
          const supportMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'support',
            timestamp: new Date(),
            status: 'delivered'
          };
          setMessages(prev => [...prev, supportMessage]);
          
          // Save support message to database
          await saveMessage(supportMessage);
        }, 1500);
      }
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    handleSendMessage(reply.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = async () => {
    try {
      // If there's a session, clear history on server first
      if (sessionId || conversationId || (user?.id || user?._id)) {
        const params = new URLSearchParams();
        if (conversationId) {
          params.append('conversationId', conversationId);
        } else if (sessionId) {
          params.append('sessionId', sessionId);
        } else if (user?.id || user?._id) {
          params.append('userId', user.id || user._id);
        }

        const response = await fetch(`/api/chat/messages?${params.toString()}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to clear history');
        }
      }

      // Clear local state
      const welcomeMessage: Message = {
        id: 'welcome',
        text: 'Hello! Welcome to PawCart Pet Shop! 🐾\n\nI\'m your AI customer service assistant, and I can help you with:\n• 🔍 Product inquiries and recommendations\n• 💰 Prices and special offers\n• 🚚 Shipping and delivery services\n• 📱 Store information\n\nHow can I assist you today?',
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages([welcomeMessage]);
      setConversationHistory([]);
      setShowQuickReplies(true);
      
      // Clear sessionId from localStorage so a new session will be created next time
      safeRemoveItem('chat_session_id');
      setSessionId(null);
      setConversationId(null);

      // Reinitialize session so user can send messages immediately
      try {
        const sessionResponse = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user?.id || user?._id
          })
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSessionId(sessionData.sessionId);
          setConversationId(sessionData.conversationId);
          safeSetItem('chat_session_id', sessionData.sessionId);
        }
      } catch (error) {
        console.error('Failed to reinitialize session:', error);
        // Don't block user from continuing, fail silently
      }

      toast({
        title: "History Cleared",
        description: "Chat history has been cleared successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-[#26732d] text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#1e5d26] p-2">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex items-center gap-1">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#26732d] font-bold text-lg">M</span>
              </div>
              <div>
                <h2 className="font-bold text-lg">PawCart Support</h2>
                <p className="text-sm text-green-200">Online • Usually replies instantly</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#1e5d26] p-2">
              <Phone size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#1e5d26] p-2">
              <Video size={20} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-[#1e5d26] p-2">
                  <MoreVertical size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={handleClearHistory}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Chat History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory && (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading conversation history...</p>
          </div>
        )}
        {!isLoadingHistory && messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex gap-2 max-w-xs lg:max-w-md">
                {/* AI Icon */}
                {message.sender === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-[#26732d] text-white rounded-br-md'
                      : message.sender === 'ai'
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 rounded-bl-md shadow-sm border border-blue-200'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                  }`}
                >
                  {/* AI Badge */}
                  {message.sender === 'ai' && (
                    <div className="flex items-center gap-1 mb-2">
                      <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                        AI Assistant
                      </Badge>
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      message.sender === 'user' ? 'text-green-200' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                    {message.sender === 'user' && message.status && (
                      <span className="text-xs text-green-200">
                        {message.status === 'sent' && '✓'}
                        {message.status === 'delivered' && '✓✓'}
                        {message.status === 'read' && '✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Cards */}
            {message.products && message.products.length > 0 && (
              <div className="ml-10 space-y-2">
                <p className="text-xs text-gray-500 font-medium">Related Products:</p>
                {message.products.map((product) => {
                  // Use slug for product link, fallback to generated slug if not available
                  const productSlug = getProductSlug(product);
                  return (
                    <Link key={product._id || product.id} href={`/product/${productSlug}`}>
                      <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-[#26732d]">
                        <div className="flex gap-3">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {product.category}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[#26732d] font-bold text-sm">
                                HK${product.price}
                              </span>
                              <Badge variant={(product.stockQuantity || product.stock || 0) > 0 ? "default" : "secondary"} className="text-xs">
                                {(product.stockQuantity || product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {showQuickReplies && messages.length <= 2 && (
        <div className="bg-gray-50 border-t p-4">
          <p className="text-xs text-gray-600 mb-3 font-semibold">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickReplies.map((reply) => (
              <Button
                key={reply.id}
                variant="outline"
                className="justify-start h-auto py-3 text-left text-gray-900 hover:bg-[#26732d] hover:text-white hover:border-[#26732d] transition-colors"
                onClick={() => handleQuickReply(reply)}
              >
                <span className="mr-2">{reply.icon}</span>
                <span className="text-sm">{reply.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex items-end gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:bg-gray-100 p-2"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            title="Toggle quick replies"
          >
            {showQuickReplies ? <Smile size={20} /> : <HelpCircle size={20} />}
          </Button>
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="resize-none border-gray-300 focus:border-[#26732d] focus:ring-[#26732d]"
              data-testid="message-input"
            />
          </div>
          <Button
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim()}
            className="bg-[#26732d] hover:bg-[#1e5d26] p-3"
            data-testid="send-message-button"
          >
            <Send size={20} />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            We typically reply within 2 minutes during business hours (10 AM - 10 PM HKT)
          </p>
          {!showQuickReplies && (
            <Button
              variant="link"
              size="sm"
              className="text-xs text-[#26732d] p-0 h-auto"
              onClick={() => setShowQuickReplies(true)}
            >
              Show quick replies
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}