import { Button } from '@/components/ui/button';

interface MissingCardProps {
  className?: string;
}

export const MissingCard = ({ className }: MissingCardProps) => {
  return (
    <div className={`bg-gradient-to-br from-red-900/100 to-orange-700/70 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-4 w-60 h-32 flex flex-col items-center justify-between text-white ${className}`}>
      <span className="text-gray-300 text-lg">실종시간</span>
      
      <span className="text-4xl font-semibold tracking-wider">01:12:43</span>
      
      <Button asChild className="relative top-1 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-6 rounded-full h-auto">
        <a href="https://ansim.nid.or.kr/service/service_03.aspx" target="_blank" rel="noopener noreferrer">
          112 신고
        </a>
      </Button>
    </div>
  );
};