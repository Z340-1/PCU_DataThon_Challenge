import { TrendingUp, TrendingDown } from 'lucide-react';
import { SuicideData } from '../types';
import { analyzeCorrelations } from '../utils/statistics';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CorrelationAnalysisProps {
  data: SuicideData[];
}

export function CorrelationAnalysis({ data }: CorrelationAnalysisProps) {
  const correlations = analyzeCorrelations(data);

  // Prepare scatter plot data for GDP vs Suicide Rate
  const scatterData = data.map(item => ({
    gdp: item.gdp_per_capita,
    rate: item.suicides_per_100k,
    country: item.country,
    year: item.year
  }));

  const getColorClass = (coefficient: number) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) return 'text-red-600 bg-red-50';
    if (abs >= 0.4) return 'text-orange-600 bg-orange-50';
    if (abs >= 0.2) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getIcon = (coefficient: number) => {
    return coefficient > 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Socioeconomic Correlation Analysis
      </h2>

      {/* Scatter Plot */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          GDP per Capita vs Suicide Rate
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="gdp"
                name="GDP per Capita"
                label={{ value: 'GDP per Capita ($)', position: 'insideBottom', offset: -5 }}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                type="number"
                dataKey="rate"
                name="Suicide Rate"
                label={{ value: 'Suicide Rate (per 100k)', angle: -90, position: 'insideLeft' }}
                domain={['dataMin', 'dataMax']}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-gray-900">{data.country}</p>
                        <p className="text-sm text-gray-600">Year: {data.year}</p>
                        <p className="text-sm text-gray-700">
                          GDP: ${data.gdp?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-700">
                          Rate: {data.rate?.toFixed(2)} per 100k
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Countries"
                data={scatterData}
                fill="#3b82f6"
                opacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Each point represents a country-year observation. The scatter plot helps visualize the
          relationship between economic indicators and suicide rates.
        </p>
      </div>

      {/* Correlation Coefficients */}
      <div className="space-y-3">
        {correlations.map((corr, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${getColorClass(corr.coefficient)}`}>
                  {getIcon(corr.coefficient)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {corr.variable1} vs {corr.variable2}
                  </div>
                  <div className="text-xs text-gray-500">Pearson Correlation</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{corr.coefficient}</div>
                <div className="text-xs text-gray-500">{corr.strength}</div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  corr.coefficient > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.abs(corr.coefficient) * 100}%`,
                  marginLeft: corr.coefficient < 0 ? 'auto' : '0'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Interpretation Guide</h3>
        <div className="text-xs text-blue-800 space-y-1">
          <p><strong>Strong (±0.7 to ±1.0):</strong> High correlation - variables move together significantly</p>
          <p><strong>Moderate (±0.4 to ±0.7):</strong> Medium correlation - variables show some relationship</p>
          <p><strong>Weak (±0.2 to ±0.4):</strong> Low correlation - weak relationship between variables</p>
          <p><strong>Very Weak (0 to ±0.2):</strong> Minimal to no linear relationship</p>
          <p className="mt-2"><strong>Positive (+):</strong> Variables increase together</p>
          <p><strong>Negative (-):</strong> One variable increases as the other decreases</p>
        </div>
      </div>
    </div>
  );
}
