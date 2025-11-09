import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { SuicideData } from '../types';

interface VisualizationChartsProps {
  data: SuicideData[];
}

export function VisualizationCharts({ data }: VisualizationChartsProps) {
  const [view, setView] = useState<'gender' | 'age' | 'country'>('gender');

  const aggregateByGender = () => {
    const grouped = data.reduce((acc, item) => {
      acc[item.sex] = (acc[item.sex] || 0) + item.suicides_no;
      return acc;
    }, {} as Record<string, number>);

    const total = data.reduce((sum, d) => sum + d.suicides_no, 0);
    return Object.entries(grouped).map(([sex, count]) => ({
      label: sex.charAt(0).toUpperCase() + sex.slice(1),
      value: count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  };

  const aggregateByAge = () => {
    const grouped = data.reduce((acc, item) => {
      acc[item.age] = (acc[item.age] || 0) + item.suicides_no;
      return acc;
    }, {} as Record<string, number>);

    const total = data.reduce((sum, d) => sum + d.suicides_no, 0);
    return Object.entries(grouped)
      .map(([age, count]) => ({
        label: age,
        value: count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  };

  const aggregateByCountry = () => {
    const grouped = data.reduce((acc, item) => {
      acc[item.country] = (acc[item.country] || 0) + item.suicides_no;
      return acc;
    }, {} as Record<string, number>);

    const total = data.reduce((sum, d) => sum + d.suicides_no, 0);
    return Object.entries(grouped)
      .map(([country, count]) => ({
        label: country,
        value: count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const getChartData = () => {
    switch (view) {
      case 'gender':
        return aggregateByGender();
      case 'age':
        return aggregateByAge();
      case 'country':
        return aggregateByCountry();
      default:
        return [];
    }
  };

  const chartData = getChartData();
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value), 0) : 0;

  const colors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Distribution Analysis</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('gender')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'gender'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Gender
          </button>
          <button
            onClick={() => setView('age')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'age'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Age Group
          </button>
          <button
            onClick={() => setView('country')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'country'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Country
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-600">
                {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${colors[index % colors.length]} transition-all duration-500 ease-out`}
                style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {view === 'country' && (
        <div className="mt-4 text-xs text-gray-500">
          Showing top 10 countries by total suicides
        </div>
      )}
    </div>
  );
}
