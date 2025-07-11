import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock } from 'lucide-react';

interface ActionButtonsProps {
  onReportClick: () => void;
  onMissingTimeClick: () => void;
}

export const ActionButtons = ({ onReportClick, onMissingTimeClick }: ActionButtonsProps) => {
  return (
    <div className="absolute top-20 left-4 right-4 z-20">
      <div className="flex justify-center space-x-4">
        <Button
          onClick={onReportClick}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8 py-3 rounded-xl"
        >
          <AlertTriangle className="h-5 w-5 mr-2" />
          신고기능
        </Button>
        
        <Button
          onClick={onMissingTimeClick}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8 py-3 rounded-xl"
        >
          <Clock className="h-5 w-5 mr-2" />
          실종시간
        </Button>
      </div>
    </div>
  );
};