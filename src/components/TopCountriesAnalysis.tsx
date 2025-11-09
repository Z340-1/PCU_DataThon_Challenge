import { Trophy, TrendingDown, TrendingUp } from 'lucide-react';
import { SuicideData } from '../types';
import { getTopCountries, CountryRate } from '../utils/advancedAnalytics';

interface TopCountriesAnalysisProps {
  data: SuicideData[];
}

export function TopCountriesAnalysis({ data }: TopCountriesAnalysisProps) {
  const { highest, lowest } = getTopCountries(data, 10);

  const CountryCard = ({ country, avgRate, totalSuicides, years, isHighest }: { country: CountryRate; avgRate: number; totalSuicides: number; years: number; isHighest: boolean }) => (
    <div className={`p-4 rounded-lg border-2 ${
      isHighest ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
    } hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{country.country}</h3>
        <Trophy className={`w-5 h-5 ${isHighest ? 'text-red-600' : 'text-green-600'}`} />
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Avg Rate (per 100k):</span>
          <span className={`font-bold ${isHighest ? 'text-red-700' : 'text-green-700'}`}>
            {avgRate.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Suicides:</span>
          <span className="font-medium text-gray-900">{totalSuicides.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Years of Data:</span>
          <span className="font-medium text-gray-900">{years}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Top Countries Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highest Rates */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="text-md font-semibold text-gray-900">Top 10 Highest Suicide Rates</h3>
          </div>
          <div className="space-y-3">
            {highest.map((country, index) => (
              <div key={country.country} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <CountryCard country={country} avgRate={country.avgRate} totalSuicides={country.totalSuicides} years={country.years} isHighest={true} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Rates */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <h3 className="text-md font-semibold text-gray-900">Top 10 Lowest Suicide Rates</h3>
          </div>
          <div className="space-y-3">
            {lowest.map((country, index) => (
              <div key={country.country} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <CountryCard country={country} avgRate={country.avgRate} totalSuicides={country.totalSuicides} years={country.years} isHighest={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Rates are calculated as average suicide rate per 100,000 population 
          over the study period. Countries with insufficient data may be excluded.
        </p>
      </div>
    </div>
  );
}

