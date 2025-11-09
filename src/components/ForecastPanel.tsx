import { TrendingUp, AlertCircle } from 'lucide-react';
import { SuicideData } from '../types';
import { arimaForecast, ARIMAForecast } from '../utils/advancedAnalytics';
import { forecastTrends } from '../utils/statistics';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastPanelProps {
  data: SuicideData[];
}

export function ForecastPanel({ data }: ForecastPanelProps) {
  const [yearsAhead, setYearsAhead] = useState(5);
  const [forecastMethod, setForecastMethod] = useState<'arima' | 'linear'>('arima');

  if (data.length < 3) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Trend Forecast</h2>
        </div>
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Insufficient data for forecasting. Please load more data points.
          </p>
        </div>
      </div>
    );
  }

  // Get historical data
  const yearlyData = data.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = { total: 0, count: 0 };
    }
    acc[item.year].total += item.suicides_per_100k;
    acc[item.year].count += 1;
    return acc;
  }, {} as Record<number, { total: number; count: number }>);

  const historicalYears = Object.keys(yearlyData).map(Number).sort();
  const historicalRates = historicalYears.map(
    year => yearlyData[year].total / yearlyData[year].count
  );

  const lastHistoricalYear = historicalYears.length > 0 
    ? Math.max(...historicalYears) 
    : new Date().getFullYear();

  // Get forecasts
  let forecasts: ARIMAForecast[] = [];
  try {
    if (forecastMethod === 'arima') {
      forecasts = arimaForecast(data, yearsAhead);
    } else {
      // Fallback to simple linear regression (from statistics.ts)
      const linearForecasts = forecastTrends(data, yearsAhead);
      forecasts = linearForecasts.map((f) => ({
        year: f.year,
        predicted: f.predicted,
        confidence_low: f.confidence_low,
        confidence_high: f.confidence_high
      }));
    }
  } catch (error) {
    console.error('Forecast error:', error);
  }

  // Prepare chart data
  const historicalChartData = historicalYears.map((year, index) => ({
    year,
    rate: historicalRates[index],
    type: 'Historical'
  }));

  const forecastChartData = forecasts.map(f => ({
    year: f.year,
    rate: f.predicted,
    lower: f.confidence_low,
    upper: f.confidence_high,
    type: 'Forecast'
  }));

  const chartData = [...historicalChartData, ...forecastChartData];

  const lastHistoricalRate = historicalRates.length > 0 
    ? historicalRates[historicalRates.length - 1] 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Time-Series Forecast</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={forecastMethod}
            onChange={(e) => setForecastMethod(e.target.value as 'arima' | 'linear')}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="arima">ARIMA</option>
            <option value="linear">Linear Regression</option>
          </select>
          <label className="text-sm text-gray-600">Forecast years:</label>
          <select
            value={yearsAhead}
            onChange={(e) => setYearsAhead(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>3 years</option>
            <option value={5}>5 years</option>
            <option value={10}>10 years</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Suicide Rate (per 100k)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-gray-900">{data.year}</p>
                      <p className="text-sm text-gray-700">
                        Rate: {data.rate?.toFixed(2)} per 100k
                      </p>
                      {data.type === 'Forecast' && (
                        <>
                          <p className="text-xs text-gray-500">
                            Lower: {data.lower?.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Upper: {data.upper?.toFixed(2)}
                          </p>
                        </>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="Suicide Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-600 mb-1">Current Rate</div>
          <div className="text-xl font-bold text-blue-900">
            {lastHistoricalRate.toFixed(2)}
          </div>
          <div className="text-xs text-blue-600">per 100k ({lastHistoricalYear})</div>
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-xs text-green-600 mb-1">
            Forecast ({forecasts[forecasts.length - 1]?.year || 'N/A'})
          </div>
          <div className="text-xl font-bold text-green-900">
            {forecasts[forecasts.length - 1]?.predicted.toFixed(2) || 'N/A'}
          </div>
          <div className="text-xs text-green-600">per 100k (predicted)</div>
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-xs text-purple-600 mb-1">Trend Direction</div>
          <div className="text-xl font-bold text-purple-900">
            {forecasts.length > 0 && forecasts[forecasts.length - 1].predicted > lastHistoricalRate
              ? '↑ Increasing'
              : '↓ Decreasing'}
          </div>
          <div className="text-xs text-purple-600">
            {forecasts.length > 0 && lastHistoricalRate > 0
              ? Math.abs(
                  ((forecasts[forecasts.length - 1].predicted - lastHistoricalRate) /
                    lastHistoricalRate) *
                    100
                ).toFixed(1)
              : '0'}
            % change
          </div>
        </div>
      </div>

      {/* Forecast Details */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Forecast Details</h3>
        <div className="space-y-2">
          {forecasts.map((forecast) => (
            <div
              key={forecast.year}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-700 font-medium">{forecast.year}</span>
              <span className="text-gray-600">
                {forecast.predicted.toFixed(2)} (95% CI: {forecast.confidence_low.toFixed(2)} - {forecast.confidence_high.toFixed(2)})
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <p>
            Forecasts use {forecastMethod === 'arima' ? 'ARIMA (AutoRegressive Integrated Moving Average)' : 'linear regression'} 
            {' '}with 95% confidence intervals.
          </p>
          <p className="mt-1">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-1" /> Historical data
            <span className="inline-block w-3 h-3 bg-green-500 border-2 border-green-700 border-dashed rounded ml-3 mr-1" /> Forecasted data
          </p>
        </div>
      </div>
    </div>
  );
}
