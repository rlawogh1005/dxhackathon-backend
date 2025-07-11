import { useState } from 'react';
import { Menu, Home, CreditCard, MapPin, Camera, Settings, HelpCircle, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'home', title: '홈 화면', icon: Home, path: '/' },
  { id: 'cards', title: '등록 카드', icon: CreditCard, path: '/cards' },
  { id: 'markers', title: '표시 아이콘', icon: MapPin, path: '/markers' },
  { id: 'photos', title: '사진 보관함', icon: Camera, path: '/photos' },
];

const bottomItems = [
  { id: 'settings', title: 'Settings', icon: Settings, path: '/settings' },
  { id: 'help', title: 'Help center', icon: HelpCircle, path: '/help' },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [activeItem, setActiveItem] = useState('home');

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-overlay z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-glass backdrop-blur-xl border-r border-glass-border z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-glass-border">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-overlay rounded-full" />
              <span className="text-lg font-semibold text-foreground">SEIZE-ON</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-glass-border"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Menu */}
          <div className="flex-1 py-6">
            <nav className="space-y-2 px-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                    activeItem === item.id 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-glass-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Menu */}
          <div className="border-t border-glass-border p-4 space-y-2">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-glass-border text-muted-foreground hover:text-foreground"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};