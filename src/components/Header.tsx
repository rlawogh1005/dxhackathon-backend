import { useState } from 'react';
import { Menu, Search, Sun, Moon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
  currentAddress: string;
  onReportClick: () => void;
  onMissingTimeClick: () => void;
}

export const Header = ({ onMenuClick, onSearch, currentAddress, onReportClick, onMissingTimeClick }: HeaderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // 실제 구현시 테마 변경 로직 추가
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-4">
      <div className="flex items-center justify-between mb-4">
        {/* Left: Menu and Address */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="bg-glass backdrop-blur-sm border border-glass-border hover:bg-glass/90"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="bg-glass backdrop-blur-sm border border-glass-border rounded-lg px-3 py-2 flex items-center">
            <Send className="h-4 w-4 mr-2 transform -rotate-45 text-white" />
            <span className="text-sm font-medium text-white">
              {currentAddress}
            </span>
          </div>
        </div>

        {/* Right: Search and Theme Toggle */}
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-glass backdrop-blur-sm border-glass-border pr-10"
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="bg-glass backdrop-blur-sm border border-glass-border hover:bg-glass/90"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};