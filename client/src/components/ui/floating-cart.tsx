
import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, MessageCircle, Send, Minimize2, Bot } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useChat } from '@/contexts/chat-context';
import { useCurrency } from '@/contexts/currency-context';
import { useLanguage } from '@/contexts/language-context';
import { translateProductName } from '@/lib/product-translator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/hooks/use-theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support' | 'ai';
  timestamp: Date;
  products?: any[];
}

export function FloatingCart() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isChatOpen, toggleChat, closeChat } = useChat();
  const [showPlatformSelection, setShowPlatformSelection] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'messenger' | 'whatsapp' | 'ai' | null>('ai');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m PawCart\'s AI customer service assistant 🤖\n\nI can help you with:\n• 🛍️ Product recommendations\n• 💰 Price inquiries\n• 📦 Shipping information\n• 💎 Membership services\n\nHow can I help you today?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state, removeItem, updateQuantity } = useCart();
  const { items, total, itemCount } = state;
  const { format } = useCurrency();
  const { language } = useLanguage();
  const [location] = useLocation();
  const { themeColor } = useTheme();

  // Draggable cart button state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Hide floating buttons on auth and admin pages
  const shouldHideFloatingButtons = [
    '/sign-in',
    '/sign-up', 
    '/forgot-password',
    '/admin'
  ].some(path => location.startsWith(path));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleToggleChat = () => {
      toggleChat();
    };

    window.addEventListener('toggleChat', handleToggleChat);
    return () => {
      window.removeEventListener('toggleChat', handleToggleChat);
    };
  }, [toggleChat]);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('cartButtonPosition');
    if (savedPosition) {
      try {
        const { x, y } = JSON.parse(savedPosition);
        const pos = { x, y };
        setPosition(pos);
        positionRef.current = pos;
      } catch (e) {
        console.error('Failed to parse saved cart position', e);
        const defaultPos = { x: window.innerWidth - 80, y: window.innerHeight - 100 };
        setPosition(defaultPos);
        positionRef.current = defaultPos;
      }
    } else {
      // Default position (bottom right)
      const defaultPos = { x: window.innerWidth - 80, y: window.innerHeight - 100 };
      setPosition(defaultPos);
      positionRef.current = defaultPos;
    }
  }, []);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    hasMovedRef.current = false;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (cartButtonRef.current) {
      const rect = cartButtonRef.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left - rect.width / 2,
        y: clientY - rect.top - rect.height / 2
      });
    }
  };

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Get button dimensions for accurate boundary calculation
      if (!cartButtonRef.current) return;
      const rect = cartButtonRef.current.getBoundingClientRect();
      const buttonWidth = rect.width;
      const buttonHeight = rect.height;
      
      // Calculate boundaries: button center can move within button half-size from edges
      const minX = buttonWidth / 2;
      const maxX = window.innerWidth - buttonWidth / 2;
      const minY = buttonHeight / 2;
      const maxY = window.innerHeight - buttonHeight / 2;

      const newX = Math.max(minX, Math.min(maxX, clientX - dragOffset.x));
      const newY = Math.max(minY, Math.min(maxY, clientY - dragOffset.y));
      
      // Check if position has actually changed
      if (Math.abs(newX - positionRef.current.x) > 5 || Math.abs(newY - positionRef.current.y) > 5) {
        hasMovedRef.current = true;
      }
      
      const newPosition = { x: newX, y: newY };
      positionRef.current = newPosition;
      setPosition(newPosition);
    };

    const handleEnd = () => {
      setIsDragging(false);
      // Save position to localStorage
      localStorage.setItem('cartButtonPosition', JSON.stringify(positionRef.current));
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragOffset]);

  const handlePlatformSelect = (platform: 'messenger' | 'whatsapp') => {
    setSelectedPlatform(platform);
    setShowPlatformSelection(false);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      // If external platform is selected, redirect
      if (selectedPlatform === 'messenger') {
        window.open('https://m.me/meow.meow.pet.shop1', '_blank');
        return;
      } else if (selectedPlatform === 'whatsapp') {
        const whatsappMessage = encodeURIComponent(`Hello PawCart Online Pet Store! ${newMessage}`);
        window.open(`https://wa.me/8801838511583?text=${whatsappMessage}`, '_blank');
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      const messageText = newMessage;
      setNewMessage('');
      
      // Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: messageText }
      ];
      
      // Call AI API
      setIsTyping(true);
      
      try {
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: messageText,
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
          products: data.products || []
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Update conversation history
        setConversationHistory([
          ...newHistory,
          { role: 'assistant', content: data.response }
        ]);
        
      } catch (error) {
        console.error('AI chat error:', error);
        setIsTyping(false);
        
        // Fallback to simple reply
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, AI service is temporarily unavailable.\n\n📞 Phone: 852-6214-6811\n📧 Email: boqianjlu@gmail.com\n⏰ Hours: Daily 10:00 AM - 10:00 PM',
          sender: 'support',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };


  // Don't render floating buttons on auth and admin pages
  if (shouldHideFloatingButtons) {
    return null;
  }

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed z-[9999] flex flex-row gap-2" style={{ left: `${position.x}px`, top: `${position.y}px`, transform: 'translate(-50%, -50%)' }}>
        {/* Cart Button - Draggable */}
        <button
          ref={cartButtonRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={(e) => {
            // Only open cart if not dragging (user didn't move the button)
            if (!hasMovedRef.current) {
              setIsCartOpen(!isCartOpen);
            }
            hasMovedRef.current = false;
          }}
          className="text-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 relative"
          style={{ 
            touchAction: 'none',
            backgroundColor: 'var(--meow-green)',
            cursor: isDragging ? 'grabbing' : 'grab',
            transform: isDragging ? 'scale(1.05)' : undefined,
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.backgroundColor = 'var(--meow-green-dark)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.backgroundColor = 'var(--meow-green)';
              e.currentTarget.style.transform = '';
            }
          }}
          data-testid="floating-cart-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white min-w-[18px] h-4 md:min-w-[20px] md:h-5 flex items-center justify-center text-xs">
              {itemCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Floating Chat Box */}
      {isChatOpen && (
        <div className="fixed bottom-36 md:bottom-24 right-4 md:right-6 w-80 h-96 bg-white rounded-lg shadow-2xl z-[9999] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 text-white rounded-t-lg" style={{ backgroundColor: 'var(--meow-green)' }}>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="PawCart Logo" className="w-8 h-8 rounded-full" />
              <div>
                <h3 className="font-bold text-sm">PawCart Support</h3>
                <p className="text-xs text-green-200">Online</p>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="p-1 rounded transition-colors"
              style={{ 
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--meow-green-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              data-testid="close-chat-button"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex gap-2 max-w-[75%]">
                    {/* AI Icon */}
                    {message.sender === 'ai' && (
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        message.sender === 'user'
                          ? 'bg-[#ffde59] text-black rounded-br-sm'
                          : message.sender === 'ai'
                          ? 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 rounded-bl-sm border border-blue-200'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {message.sender === 'ai' && (
                        <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 mb-1">
                          AI Assistant
                        </Badge>
                      )}
                      <p className="whitespace-pre-line">{message.text}</p>
                      <span className={`text-xs mt-1 block ${
                        message.sender === 'user' ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Platform Selection Buttons - Show after first message */}
                {index === 0 && showPlatformSelection && (
                  <div className="flex justify-start mt-3">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handlePlatformSelect('messenger')}
                        className="bg-[#0084ff] hover:bg-[#0066cc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        data-testid="messenger-button"
                      >
                        <MessageCircle size={16} />
                        Messenger
                      </button>
                      <button
                        onClick={() => handlePlatformSelect('whatsapp')}
                        className="bg-[#25d366] hover:bg-[#20b358] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        data-testid="whatsapp-button"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-sm px-3 py-2">
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

          {/* Input Area */}
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 text-sm text-gray-900 bg-white"
                data-testid="chat-message-input"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3"
                data-testid="send-chat-message-button"
              >
                <Send size={16} />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              AI Assistant at your service
            </p>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Cart Panel - Right-sided for both mobile and desktop */}
          <div className="fixed 
            /* Mobile: Right-sided panel */
            top-0 right-0 bottom-0
            w-[85vw] max-w-sm rounded-l-2xl
            /* Desktop: Large right sidebar style */
            md:top-0 md:right-0 md:bottom-0 md:w-[450px] md:max-w-[450px] md:h-full md:rounded-none
            lg:w-[500px] lg:max-w-[500px]
            bg-white shadow-2xl z-[9999] transform transition-transform duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b text-white flex-shrink-0 rounded-tl-2xl md:rounded-none shadow-md" style={{ backgroundColor: 'var(--meow-green)' }}>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                    <circle cx="8" cy="21" r="1"></circle>
                    <circle cx="19" cy="21" r="1"></circle>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Shopping Cart</h2>
                  {itemCount > 0 && (
                    <p className="text-xs text-white/80 mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-white/20 hover:scale-110"
                style={{ 
                  backgroundColor: 'transparent',
                }}
                data-testid="close-cart-button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 md:p-12 text-center">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 md:p-8 rounded-full mb-6 shadow-inner">
                    <ShoppingCart size={48} className="md:w-16 md:h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-8 text-sm md:text-base max-w-xs">Looks like you haven't added any items to your cart yet.</p>
                  <Button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ 
                      backgroundColor: 'var(--meow-green)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--meow-green-dark)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--meow-green)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="p-4 md:p-6 space-y-4">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#26732d]/30" 
                      data-testid={`cart-item-${item.id}`}
                    >
                      <div className="flex gap-4">
                        {/* Product Image - Enhanced with better styling */}
                        <div className="flex-shrink-0">
                          <div className="relative w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                            <img 
                              src={item.image || '/api/placeholder/96/96'} 
                              alt={translateProductName(item.name, language)}
                              className="w-full h-full object-contain p-2"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base leading-tight line-clamp-2 mb-2 group-hover:text-[#26732d] transition-colors duration-200">
                            {translateProductName(item.name, language)}
                          </h4>
                          <div className="flex items-baseline gap-2 mb-3">
                            <p className="font-bold text-base md:text-lg" style={{ color: 'var(--meow-green)' }}>
                              {format(item.price)}
                            </p>
                            <span className="text-xs text-gray-500">each</span>
                          </div>
                          
                          {/* Quantity Controls - Enhanced */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-200">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="bg-white hover:bg-gray-100 rounded-full p-1.5 md:p-2 transition-all duration-200 shadow-sm hover:shadow text-black hover:scale-110"
                                data-testid={`decrease-quantity-${item.id}`}
                              >
                                <Minus size={14} className="md:w-4 md:h-4" />
                              </button>
                              <span className="w-10 md:w-12 text-center text-sm md:text-base font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="bg-white hover:bg-[#26732d] hover:text-white rounded-full p-1.5 md:p-2 transition-all duration-200 shadow-sm hover:shadow text-black hover:scale-110"
                                data-testid={`increase-quantity-${item.id}`}
                              >
                                <Plus size={14} className="md:w-4 md:h-4" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 rounded-full p-2 md:p-2.5 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110"
                              data-testid={`remove-item-${item.id}`}
                            >
                              <Trash2 size={14} className="md:w-4 md:h-4" />
                            </button>
                          </div>
                          
                          {/* Item Subtotal */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Subtotal</span>
                              <span className="font-bold text-base md:text-lg text-gray-900">
                                {format(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 flex-shrink-0 shadow-lg">
                <div className="mb-4 md:mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 uppercase tracking-wide">Items ({itemCount})</span>
                    <span className="text-base font-semibold text-gray-700">{format(total)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-lg md:text-xl font-bold text-gray-900">Total:</span>
                    <span className="text-xl md:text-2xl font-bold" style={{ color: 'var(--meow-green)' }}>{format(total)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link href="/checkout">
                    <Button 
                      className="w-full text-white md:py-3 md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                      style={{ 
                        backgroundColor: 'var(--meow-green)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--meow-green-dark)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--meow-green)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => setIsCartOpen(false)}
                      data-testid="checkout-button"
                    >
                      Checkout
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button 
                      variant="outline" 
                      className="w-full md:py-3 md:text-lg rounded-full border-2 font-semibold transition-all duration-300 hover:shadow-md"
                      style={{ 
                        borderColor: 'var(--meow-green)',
                        color: 'var(--meow-green)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--meow-green)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--meow-green)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => setIsCartOpen(false)}
                      data-testid="view-cart-button"
                    >
                      View Cart
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
