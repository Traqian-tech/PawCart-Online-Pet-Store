import { useState } from 'react';
import { Phone, MessageCircle, Mail, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';

export default function FloatingSupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  const supportOptions = [
    {
      icon: Phone,
      label: 'Call Us',
      sublabel: '852-6214-6811',
      action: () => window.location.href = 'tel:+85262146811',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: MessageCircle,
      label: 'Live Chat',
      sublabel: 'Instant reply',
      link: '/messenger',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Mail,
      label: 'Email',
      sublabel: 'Detailed help',
      link: '/contact',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      icon: HelpCircle,
      label: 'Help Center',
      sublabel: 'Browse FAQ',
      link: '/help-center',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-50">
        {/* Options Menu */}
        {isOpen && (
          <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              const content = (
                <Card 
                  className="shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-0">
                    <div className={`${option.color} text-white px-4 py-3 rounded-lg flex items-center gap-3 min-w-[200px]`}>
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm">{option.label}</div>
                        <div className="text-xs opacity-90">{option.sublabel}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );

              if (option.link) {
                return (
                  <Link key={index} href={option.link} onClick={() => setIsOpen(false)}>
                    {content}
                  </Link>
                );
              }

              return (
                <div key={index} onClick={() => { option.action?.(); setIsOpen(false); }}>
                  {content}
                </div>
              );
            })}
          </div>
        )}

        {/* Main Toggle Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full shadow-2xl transition-all duration-300 rotate-0"
          style={
            isOpen
              ? { backgroundColor: '#4B5563' }
              : {
                  background: `linear-gradient(to right, var(--meow-green), var(--meow-green-dark))`,
                }
          }
          onMouseEnter={(e) => {
            if (!isOpen) {
              e.currentTarget.style.background = `linear-gradient(to right, var(--meow-green-dark), var(--meow-green))`;
            } else {
              e.currentTarget.style.backgroundColor = '#374151';
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.background = `linear-gradient(to right, var(--meow-green), var(--meow-green-dark))`;
            } else {
              e.currentTarget.style.backgroundColor = '#4B5563';
            }
          }}
          aria-label="Customer Support"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <div className="relative">
              <Headphones className="w-7 h-7 text-white" />
              {/* Pulse animation */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--meow-yellow)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--meow-yellow)]"></span>
              </span>
            </div>
          )}
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

// Headphones icon component (since it's not in lucide-react by default)
function Headphones({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

