import { Users, AlertTriangle } from 'lucide-react';
import { SuicideData } from '../types';
import { analyzeGenerations, GenerationStats } from '../utils/advancedAnalytics';

interface GenerationCohortAnalysisProps {
  data: SuicideData[];
}

export function GenerationCohortAnalysis({ data }: GenerationCohortAnalysisProps) {
  const generationStats = analyzeGenerations(data);

  const maxRate = generationStats.length > 0 
    ? Math.max(...generationStats.map(g => g.avgRate)) 
    : 0;
  const minRate = generationStats.length > 0 
    ? Math.min(...generationStats.map(g => g.avgRate)) 
    : 0;
  const range = maxRate - minRate || 1;

  const colors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];

  const getRiskLevel = (rate: number): { level: string; color: string; bgColor: string } => {
    const percentile = ((rate - minRate) / range) * 100;
    if (percentile >= 75) {
      return { level: 'Very High', color: 'text-red-700', bgColor: 'bg-red-100' };
    } else if (percentile >= 50) {
      return { level: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100' };
    } else if (percentile >= 25) {
      return { level: 'Moderate', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    } else {
      return { level: 'Low', color: 'text-green-700', bgColor: 'bg-green-100' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Generation Cohort Analysis</h2>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          This analysis compares suicide risk levels across different generation cohorts, helping identify
          which generations face higher risks and require targeted prevention strategies.
        </p>
      </div>

      {/* Generation Statistics */}
      <div className="space-y-4">
        {generationStats.map((gen, index) => {
          const risk = getRiskLevel(gen.avgRate);
          const height = ((gen.avgRate - minRate) / range) * 100;

          return (
            <div
              key={gen.generation}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white font-bold`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{gen.generation}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${risk.bgColor} ${risk.color}`}>
                        {risk.level} Risk
                      </span>
                      <span className="text-xs text-gray-500">
                        {gen.countries} countries
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {gen.avgRate.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">per 100k</div>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                    style={{ width: `${height}%` }}
                  />
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Suicides</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {gen.totalSuicides.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Data Points</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {gen.count.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Countries</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {gen.countries}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Comparison */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Risk Level Interpretation</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2 bg-red-100 rounded">
            <div className="font-medium text-red-700">Very High (Top 25%)</div>
            <div className="text-red-600">Requires immediate intervention</div>
          </div>
          <div className="p-2 bg-orange-100 rounded">
            <div className="font-medium text-orange-700">High (50-75%)</div>
            <div className="text-orange-600">Enhanced prevention needed</div>
          </div>
          <div className="p-2 bg-yellow-100 rounded">
            <div className="font-medium text-yellow-700">Moderate (25-50%)</div>
            <div className="text-yellow-600">Standard prevention programs</div>
          </div>
          <div className="p-2 bg-green-100 rounded">
            <div className="font-medium text-green-700">Low (Bottom 25%)</div>
            <div className="text-green-600">Maintain current strategies</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {generationStats.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">Key Insights</h3>
          <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
            {generationStats.length > 0 && (
              <li>
                <strong>{generationStats[0].generation}</strong> has the highest average suicide rate
                ({generationStats[0].avgRate.toFixed(2)} per 100k), indicating this cohort needs
                urgent attention.
              </li>
            )}
            <li>
              The difference between highest and lowest risk generations is{' '}
              {(maxRate - minRate).toFixed(2)} per 100k, showing significant variation across cohorts.
            </li>
            <li>
              Prevention programs should be tailored to address the specific risk factors affecting
              each generation cohort.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

