import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock } from 'lucide-react';

interface ActionButtonsProps {
  onReportClick: () => void;
  onMissingTimeClick: () => void;
}

export const ActionButtons = ({ onReportClick, onMissingTimeClick }: ActionButtonsProps) => {
  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex space-x-4">
        <Button
          onClick={onReportClick}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-xl shadow-lg"
        >
          신고기능
        </Button>
        
        <Button
          onClick={onMissingTimeClick}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-xl shadow-lg"
        >
          실종시간
        </Button>
      </div>
    </div>
  );
};