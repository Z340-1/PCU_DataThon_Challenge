import { Statistics, SuicideData, CorrelationResult, ForecastPoint } from '../types';

export const calculateStatistics = (values: number[]): Statistics => {
  if (values.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0, total: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;

  const median = values.length % 2 === 0
    ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
    : sorted[Math.floor(values.length / 2)];

  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    min: Math.min(...values),
    max: Math.max(...values),
    stdDev: Number(stdDev.toFixed(2)),
    total: sum
  };
};

export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);
  const sumY2 = y.reduce((acc, val) => acc + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

export const getCorrelationStrength = (coefficient: number): string => {
  const abs = Math.abs(coefficient);
  if (abs >= 0.7) return 'Strong';
  if (abs >= 0.4) return 'Moderate';
  if (abs >= 0.2) return 'Weak';
  return 'Very Weak';
};

export const analyzeCorrelations = (data: SuicideData[]): CorrelationResult[] => {
  const suicideRates = data.map(d => d.suicides_per_100k);
  const gdpPerCapita = data.map(d => d.gdp_per_capita);
  const population = data.map(d => d.population);

  const correlations: CorrelationResult[] = [
    {
      variable1: 'Suicide Rate',
      variable2: 'GDP per Capita',
      coefficient: Number(calculateCorrelation(suicideRates, gdpPerCapita).toFixed(3)),
      strength: ''
    },
    {
      variable1: 'Suicide Rate',
      variable2: 'Population',
      coefficient: Number(calculateCorrelation(suicideRates, population).toFixed(3)),
      strength: ''
    }
  ];

  return correlations.map(corr => ({
    ...corr,
    strength: getCorrelationStrength(corr.coefficient)
  }));
};

export const simpleLinearRegression = (x: number[], y: number[]): { slope: number; intercept: number } => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

export const forecastTrends = (data: SuicideData[], yearsAhead: number = 5): ForecastPoint[] => {
  const yearlyData = data.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = { total: 0, count: 0 };
    }
    acc[item.year].total += item.suicides_per_100k;
    acc[item.year].count += 1;
    return acc;
  }, {} as Record<number, { total: number; count: number }>);

  const years = Object.keys(yearlyData).map(Number).sort();
  const rates = years.map(year => yearlyData[year].total / yearlyData[year].count);

  const { slope, intercept } = simpleLinearRegression(years, rates);

  const residuals = years.map((year, i) => rates[i] - (slope * year + intercept));
  const mse = residuals.reduce((acc, r) => acc + r * r, 0) / residuals.length;
  const standardError = Math.sqrt(mse);

  const lastYear = Math.max(...years);
  const forecasts: ForecastPoint[] = [];

  for (let i = 1; i <= yearsAhead; i++) {
    const futureYear = lastYear + i;
    const predicted = slope * futureYear + intercept;
    const marginOfError = 1.96 * standardError * Math.sqrt(1 + 1 / years.length);

    forecasts.push({
      year: futureYear,
      predicted: Number(Math.max(0, predicted).toFixed(2)),
      confidence_low: Number(Math.max(0, predicted - marginOfError).toFixed(2)),
      confidence_high: Number(Math.max(0, predicted + marginOfError).toFixed(2))
    });
  }

  return forecasts;
};

export const cleanData = (rawData: any[]): SuicideData[] => {
  return rawData
    .filter(item =>
      item.country &&
      item.year &&
      item.sex &&
      item.age &&
      item.year >= 1985 &&
      item.year <= 2025
    )
    .map((item, index) => ({
      id: item.id || `record-${index}`,
      country: String(item.country).trim(),
      year: Number(item.year),
      sex: String(item.sex).trim(),
      age: String(item.age).trim(),
      suicides_no: Number(item.suicides_no) || 0,
      population: Number(item.population) || 0,
      suicides_per_100k: Number(item.suicides_per_100k) ||
        (item.population > 0 ? (Number(item.suicides_no) / Number(item.population)) * 100000 : 0),
      gdp_per_capita: Number(item.gdp_per_capita) || 0,
      generation: String(item.generation || 'Unknown').trim()
    }));
};
