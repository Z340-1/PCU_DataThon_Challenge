import { TrendingUp, Users, Globe, Calendar } from 'lucide-react';
import { SuicideData, Statistics } from '../types';
import { calculateStatistics } from '../utils/statistics';

interface StatisticsPanelProps {
  data: SuicideData[];
}

export function StatisticsPanel({ data }: StatisticsPanelProps) {
  const suicideRates = data.map(d => d.suicides_per_100k);
  const stats = calculateStatistics(suicideRates);

  const totalSuicides = data.reduce((sum, d) => sum + d.suicides_no, 0);
  const countries = new Set(data.map(d => d.country)).size;
  const years = new Set(data.map(d => d.year));
  const yearRange = years.size > 0 ? `${Math.min(...years)} - ${Math.max(...years)}` : 'N/A';

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Overview Statistics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Suicides"
          value={totalSuicides.toLocaleString()}
          color="text-red-600"
        />
        <StatCard
          icon={Globe}
          label="Countries"
          value={countries}
          color="text-blue-600"
        />
        <StatCard
          icon={Calendar}
          label="Year Range"
          value={yearRange}
          color="text-green-600"
        />
        <StatCard
          icon={Users}
          label="Total Records"
          value={data.length.toLocaleString()}
          color="text-purple-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">
          Suicide Rate Statistics (per 100k)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mean</div>
            <div className="text-xl font-semibold text-gray-900">{stats.mean}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Median</div>
            <div className="text-xl font-semibold text-gray-900">{stats.median}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Std Dev</div>
            <div className="text-xl font-semibold text-gray-900">{stats.stdDev}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Min</div>
            <div className="text-xl font-semibold text-gray-900">{stats.min}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Max</div>
            <div className="text-xl font-semibold text-gray-900">{stats.max}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
