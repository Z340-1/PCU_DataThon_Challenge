import { TrendingUp, Globe, MapPin } from 'lucide-react';
import { SuicideData } from '../types';
import { calculateYearTrends, YearTrend } from '../utils/advancedAnalytics';
import { useState } from 'react';

interface TrendAnalysisProps {
  data: SuicideData[];
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  const [showRegions, setShowRegions] = useState(false);
  const trends = calculateYearTrends(data, showRegions);

  const maxRate = trends.length > 0 
    ? Math.max(...trends.map(t => t.globalRate)) 
    : 0;
  const minRate = trends.length > 0 
    ? Math.min(...trends.map(t => t.globalRate)) 
    : 0;
  const range = maxRate - minRate || 1;

  // Calculate overall trend direction
  const firstRate = trends[0]?.globalRate || 0;
  const lastRate = trends[trends.length - 1]?.globalRate || 0;
  const trendDirection = lastRate > firstRate ? 'increasing' : 'decreasing';
  const trendPercentage = firstRate > 0 
    ? Math.abs(((lastRate - firstRate) / firstRate) * 100)
    : 0;

  // Get unique regions
  const regions = showRegions && trends.length > 0 && trends[0].byRegion
    ? Object.keys(trends[0].byRegion!)
    : [];

  const regionColors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Year-over-Year Trends</h2>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showRegions}
            onChange={(e) => setShowRegions(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show by Region</span>
        </label>
      </div>

      {/* Global Trend Chart */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-gray-600" />
          <h3 className="text-md font-semibold text-gray-900">Global Trend</h3>
        </div>
        <div className="relative h-64 mb-4">
          <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
            {[maxRate, (maxRate + minRate) / 2, minRate].map((val, i) => (
              <div key={i} className="text-right">{val.toFixed(1)}</div>
            ))}
          </div>
          <div className="ml-12 h-full border-l border-b border-gray-300 relative">
            <div className="absolute inset-0 flex items-end gap-1 pb-8 pl-2">
              {trends.map((trend, index) => {
                const height = ((trend.globalRate - minRate) / range) * 100;
                const isIncreasing = index > 0 && trend.globalRate > trends[index - 1].globalRate;
                return (
                  <div key={trend.year} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full">
                      <div
                        className={`w-full transition-all duration-300 rounded-t ${
                          isIncreasing ? 'bg-red-500' : 'bg-blue-500'
                        } hover:opacity-80`}
                        style={{ height: `${Math.max(height * 2, 4)}px` }}
                      />
                      <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {trend.year}: {trend.globalRate.toFixed(2)} per 100k
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 rotate-45 origin-top-left mt-2">
                      {trend.year}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trend Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-600 mb-1">Starting Rate</div>
            <div className="text-xl font-bold text-blue-900">
              {firstRate.toFixed(2)}
            </div>
            <div className="text-xs text-blue-600">({trends[0]?.year || 'N/A'})</div>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-xs text-purple-600 mb-1">Current Rate</div>
            <div className="text-xl font-bold text-purple-900">
              {lastRate.toFixed(2)}
            </div>
            <div className="text-xs text-purple-600">({trends[trends.length - 1]?.year || 'N/A'})</div>
          </div>
          <div className={`p-3 border rounded-lg ${
            trendDirection === 'increasing' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className={`text-xs mb-1 ${
              trendDirection === 'increasing' ? 'text-red-600' : 'text-green-600'
            }`}>
              Trend
            </div>
            <div className={`text-xl font-bold ${
              trendDirection === 'increasing' ? 'text-red-900' : 'text-green-900'
            }`}>
              {trendDirection === 'increasing' ? '↑' : '↓'} {trendPercentage.toFixed(1)}%
            </div>
            <div className={`text-xs ${
              trendDirection === 'increasing' ? 'text-red-600' : 'text-green-600'
            }`}>
              {trendDirection === 'increasing' ? 'Increasing' : 'Decreasing'}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Trends */}
      {showRegions && regions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-gray-600" />
            <h3 className="text-md font-semibold text-gray-900">Regional Trends</h3>
          </div>
          <div className="space-y-4">
            {regions.map((region, regionIdx) => {
              const regionRates = trends
                .filter(t => t.byRegion && t.byRegion[region])
                .map(t => ({ year: t.year, rate: t.byRegion![region] }));
              
              if (regionRates.length === 0) return null;

              const regionMax = Math.max(...regionRates.map(r => r.rate));
              const regionMin = Math.min(...regionRates.map(r => r.rate));
              const regionRange = regionMax - regionMin || 1;

              return (
                <div key={region} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{region}</h4>
                    <div className="text-sm text-gray-600">
                      Avg: {(regionRates.reduce((sum, r) => sum + r.rate, 0) / regionRates.length).toFixed(2)} per 100k
                    </div>
                  </div>
                  <div className="relative h-32">
                    <div className="absolute inset-0 flex items-end gap-1">
                      {regionRates.map((r, idx) => {
                        const height = ((r.rate - regionMin) / regionRange) * 100;
                        return (
                          <div key={r.year} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="relative w-full">
                              <div
                                className={`w-full ${regionColors[regionIdx % regionColors.length]} rounded-t opacity-70 hover:opacity-100 transition-opacity`}
                                style={{ height: `${Math.max(height, 4)}px` }}
                              />
                              <div className="hidden group-hover:block absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                                {r.year}: {r.rate.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">{r.year}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!showRegions && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            Enable "Show by Region" to see regional breakdowns of suicide rate trends.
          </p>
        </div>
      )}
    </div>
  );
}

