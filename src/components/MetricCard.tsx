import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  colorClass?: string;
}

export default function MetricCard({ title, value, icon: Icon, colorClass = 'text-blue-600' }: MetricCardProps) {
  return (
    <div className="bg-[#537d90] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <div className={`${colorClass} bg-opacity-10 p-3 rounded-full`}>
          <Icon size={24} className={colorClass} />
        </div>
      </div>
    </div>
  );
}
