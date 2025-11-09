import { SuicideData } from '../types';

// Multiple Linear Regression
export interface RegressionModel {
  coefficients: Record<string, number>;
  intercept: number;
  rSquared: number;
  predictions: number[];
}

export function multipleLinearRegression(
  data: SuicideData[],
  predictors: string[]
): RegressionModel {
  // Prepare data matrix
  const X: number[][] = [];
  const y: number[] = [];

  data.forEach((item) => {
    const row: number[] = [];
    predictors.forEach((pred) => {
      switch (pred) {
        case 'gdp_per_capita':
          row.push(item.gdp_per_capita);
          break;
        case 'year':
          row.push(item.year);
          break;
        case 'population':
          row.push(Math.log(item.population + 1)); // Log transform for scale
          break;
        case 'sex_male':
          row.push(item.sex === 'male' ? 1 : 0);
          break;
        case 'age_15_24':
          row.push(item.age.includes('15-24') ? 1 : 0);
          break;
        case 'age_25_34':
          row.push(item.age.includes('25-34') ? 1 : 0);
          break;
        case 'age_35_54':
          row.push(item.age.includes('35-54') ? 1 : 0);
          break;
        case 'age_55_74':
          row.push(item.age.includes('55-74') ? 1 : 0);
          break;
        case 'age_75_plus':
          row.push(item.age.includes('75+') ? 1 : 0);
          break;
        default:
          row.push(0);
      }
    });
    X.push(row);
    y.push(item.suicides_per_100k);
  });

  // Normalize features
  const normalizedX = normalizeMatrix(X);
  
  // Add intercept column
  const XWithIntercept = normalizedX.map(row => [1, ...row]);
  
  // Solve using least squares: (X'X)^(-1)X'y
  const coefficients = solveLeastSquares(XWithIntercept, y);
  
  // Calculate predictions and R-squared
  const predictions = XWithIntercept.map(row => 
    row.reduce((sum, val, i) => sum + val * coefficients[i], 0)
  );
  
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
  const ssTot = y.reduce((sum, yi) => {
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    return sum + Math.pow(yi - mean, 2);
  }, 0);
  const rSquared = 1 - (ssRes / ssTot);

  const intercept = coefficients[0];
  const coefMap: Record<string, number> = {};
  predictors.forEach((pred, i) => {
    coefMap[pred] = coefficients[i + 1];
  });

  return {
    coefficients: coefMap,
    intercept,
    rSquared: Math.max(0, Math.min(1, rSquared)),
    predictions
  };
}

function normalizeMatrix(matrix: number[][]): number[][] {
  if (matrix.length === 0) return matrix;
  
  const numFeatures = matrix[0].length;
  const means: number[] = [];
  const stds: number[] = [];
  
  // Calculate means and standard deviations
  for (let j = 0; j < numFeatures; j++) {
    const values = matrix.map(row => row[j]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance) || 1;
    
    means.push(mean);
    stds.push(std);
  }
  
  // Normalize
  return matrix.map(row =>
    row.map((val, j) => (val - means[j]) / stds[j])
  );
}

function solveLeastSquares(X: number[][], y: number[]): number[] {
  const n = X.length;
  const m = X[0].length;
  
  // Compute X'X
  const XtX: number[][] = [];
  for (let i = 0; i < m; i++) {
    XtX[i] = [];
    for (let j = 0; j < m; j++) {
      XtX[i][j] = X.reduce((sum, row) => sum + row[i] * row[j], 0);
    }
  }
  
  // Compute X'y
  const Xty: number[] = [];
  for (let i = 0; i < m; i++) {
    Xty[i] = X.reduce((sum, row, idx) => sum + row[i] * y[idx], 0);
  }
  
  // Solve using Gaussian elimination
  return gaussianElimination(XtX, Xty);
}

function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Eliminate
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j < n + 1; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }
  
  return x;
}

// K-Means Clustering
export interface ClusterResult {
  clusters: number[];
  centroids: number[][];
  countries: string[];
}

export function kMeansClustering(
  data: SuicideData[],
  k: number = 3
): ClusterResult {
  // Aggregate by country
  const countryData = data.reduce((acc, item) => {
    if (!acc[item.country]) {
      acc[item.country] = {
        country: item.country,
        rates: [] as number[],
        gdp: [] as number[],
        years: [] as number[]
      };
    }
    acc[item.country].rates.push(item.suicides_per_100k);
    acc[item.country].gdp.push(item.gdp_per_capita);
    acc[item.country].years.push(item.year);
    return acc;
  }, {} as Record<string, { country: string; rates: number[]; gdp: number[]; years: number[] }>);

  const countries = Object.keys(countryData);
  const features: number[][] = countries.map(country => {
    const cd = countryData[country];
    const avgRate = cd.rates.reduce((a, b) => a + b, 0) / cd.rates.length;
    const avgGdp = cd.gdp.reduce((a, b) => a + b, 0) / cd.gdp.length;
    const trend = cd.rates.length > 1 
      ? (cd.rates[cd.rates.length - 1] - cd.rates[0]) / cd.rates.length
      : 0;
    return [avgRate, avgGdp / 1000, trend]; // Normalize GDP
  });

  // Initialize centroids randomly
  let centroids: number[][] = [];
  for (let i = 0; i < k; i++) {
    const randomIdx = Math.floor(Math.random() * features.length);
    centroids.push([...features[randomIdx]]);
  }

  let clusters: number[] = new Array(features.length).fill(0);
  let changed = true;
  let iterations = 0;
  const maxIterations = 100;

  while (changed && iterations < maxIterations) {
    // Assign clusters
    const newClusters = features.map((point, idx) => {
      let minDist = Infinity;
      let cluster = 0;
      centroids.forEach((centroid, cIdx) => {
        const dist = euclideanDistance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          cluster = cIdx;
        }
      });
      return cluster;
    });

    changed = !newClusters.every((c, i) => c === clusters[i]);
    clusters = newClusters;

    // Update centroids
    centroids = centroids.map((_, cIdx) => {
      const clusterPoints = features.filter((_, idx) => clusters[idx] === cIdx);
      if (clusterPoints.length === 0) return centroids[cIdx];
      
      const numFeatures = features[0].length;
      const newCentroid: number[] = [];
      for (let j = 0; j < numFeatures; j++) {
        const sum = clusterPoints.reduce((acc, point) => acc + point[j], 0);
        newCentroid[j] = sum / clusterPoints.length;
      }
      return newCentroid;
    });

    iterations++;
  }

  return {
    clusters,
    centroids,
    countries
  };
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

// ARIMA-like Time Series Forecasting
export interface ARIMAForecast {
  year: number;
  predicted: number;
  confidence_low: number;
  confidence_high: number;
}

export function arimaForecast(
  data: SuicideData[],
  yearsAhead: number = 5
): ARIMAForecast[] {
  // Aggregate by year
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

  if (years.length < 3) {
    // Fallback to simple linear regression
    return simpleARIMAForecast(years, rates, yearsAhead);
  }

  // Calculate differences (differencing for stationarity)
  const diff1 = rates.slice(1).map((val, i) => val - rates[i]);
  
  // Simple AR(1) model: y_t = c + φ*y_{t-1} + ε_t
  const arCoeff = estimateAR1(diff1);
  
  // Forecast
  const lastYear = Math.max(...years);
  const lastRate = rates[rates.length - 1];
  const lastDiff = diff1[diff1.length - 1] || 0;
  
  const forecasts: ARIMAForecast[] = [];
  let currentDiff = lastDiff;
  const residuals = diff1.slice(1).map((val, i) => val - (arCoeff * diff1[i]));
  const residualStd = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length
  );

  for (let i = 1; i <= yearsAhead; i++) {
    currentDiff = arCoeff * currentDiff;
    const predicted = lastRate + currentDiff * i;
    const marginOfError = 1.96 * residualStd * Math.sqrt(i);
    
    forecasts.push({
      year: lastYear + i,
      predicted: Number(Math.max(0, predicted).toFixed(2)),
      confidence_low: Number(Math.max(0, predicted - marginOfError).toFixed(2)),
      confidence_high: Number(Math.max(0, predicted + marginOfError).toFixed(2))
    });
  }

  return forecasts;
}

function estimateAR1(series: number[]): number {
  if (series.length < 2) return 0;
  
  let sumXY = 0;
  let sumX2 = 0;
  
  for (let i = 1; i < series.length; i++) {
    sumXY += series[i] * series[i - 1];
    sumX2 += series[i - 1] * series[i - 1];
  }
  
  return sumX2 === 0 ? 0 : sumXY / sumX2;
}

function simpleARIMAForecast(
  years: number[],
  rates: number[],
  yearsAhead: number
): ARIMAForecast[] {
  const n = years.length;
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = rates.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((sum, year, i) => sum + year * rates[i], 0);
  const sumX2 = years.reduce((sum, year) => sum + year * year, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const residuals = rates.map((rate, i) => rate - (slope * years[i] + intercept));
  const mse = residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length;
  const stdError = Math.sqrt(mse);
  
  const lastYear = Math.max(...years);
  const forecasts: ARIMAForecast[] = [];
  
  for (let i = 1; i <= yearsAhead; i++) {
    const futureYear = lastYear + i;
    const predicted = slope * futureYear + intercept;
    const marginOfError = 1.96 * stdError * Math.sqrt(1 + 1 / n);
    
    forecasts.push({
      year: futureYear,
      predicted: Number(Math.max(0, predicted).toFixed(2)),
      confidence_low: Number(Math.max(0, predicted - marginOfError).toFixed(2)),
      confidence_high: Number(Math.max(0, predicted + marginOfError).toFixed(2))
    });
  }
  
  return forecasts;
}

// Top Countries Analysis
export interface CountryRate {
  country: string;
  avgRate: number;
  totalSuicides: number;
  years: number;
}

export function getTopCountries(
  data: SuicideData[],
  topN: number = 10
): { highest: CountryRate[]; lowest: CountryRate[] } {
  const countryData = data.reduce((acc, item) => {
    if (!acc[item.country]) {
      acc[item.country] = {
        country: item.country,
        totalRate: 0,
        totalSuicides: 0,
        count: 0,
        years: new Set<number>()
      };
    }
    acc[item.country].totalRate += item.suicides_per_100k;
    acc[item.country].totalSuicides += item.suicides_no;
    acc[item.country].count += 1;
    acc[item.country].years.add(item.year);
    return acc;
  }, {} as Record<string, { country: string; totalRate: number; totalSuicides: number; count: number; years: Set<number> }>);

  const countries: CountryRate[] = Object.values(countryData).map(cd => ({
    country: cd.country,
    avgRate: cd.totalRate / cd.count,
    totalSuicides: cd.totalSuicides,
    years: cd.years.size
  }));

  const sorted = [...countries].sort((a, b) => b.avgRate - a.avgRate);
  
  return {
    highest: sorted.slice(0, topN),
    lowest: sorted.slice(-topN).reverse()
  };
}

// Generation Cohort Analysis
export interface GenerationStats {
  generation: string;
  avgRate: number;
  totalSuicides: number;
  count: number;
  countries: number;
}

export function analyzeGenerations(data: SuicideData[]): GenerationStats[] {
  const genData = data.reduce((acc, item) => {
    if (!acc[item.generation]) {
      acc[item.generation] = {
        generation: item.generation,
        totalRate: 0,
        totalSuicides: 0,
        count: 0,
        countries: new Set<string>()
      };
    }
    acc[item.generation].totalRate += item.suicides_per_100k;
    acc[item.generation].totalSuicides += item.suicides_no;
    acc[item.generation].count += 1;
    acc[item.generation].countries.add(item.country);
    return acc;
  }, {} as Record<string, { generation: string; totalRate: number; totalSuicides: number; count: number; countries: Set<string> }>);

  return Object.values(genData).map(gd => ({
    generation: gd.generation,
    avgRate: gd.totalRate / gd.count,
    totalSuicides: gd.totalSuicides,
    count: gd.count,
    countries: gd.countries.size
  })).sort((a, b) => b.avgRate - a.avgRate);
}

// Year-over-Year Trends
export interface YearTrend {
  year: number;
  globalRate: number;
  byRegion?: Record<string, number>;
}

export function calculateYearTrends(
  data: SuicideData[],
  includeRegions: boolean = false
): YearTrend[] {
  const yearData = data.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = {
        totalRate: 0,
        count: 0,
        regions: {} as Record<string, { totalRate: number; count: number }>
      };
    }
    acc[item.year].totalRate += item.suicides_per_100k;
    acc[item.year].count += 1;
    
    if (includeRegions) {
      // Simple region mapping (can be enhanced)
      const region = getRegion(item.country);
      if (!acc[item.year].regions[region]) {
        acc[item.year].regions[region] = { totalRate: 0, count: 0 };
      }
      acc[item.year].regions[region].totalRate += item.suicides_per_100k;
      acc[item.year].regions[region].count += 1;
    }
    
    return acc;
  }, {} as Record<number, { totalRate: number; count: number; regions: Record<string, { totalRate: number; count: number }> }>);

  return Object.keys(yearData)
    .map(Number)
    .sort()
    .map(year => {
      const yd = yearData[year];
      const trend: YearTrend = {
        year,
        globalRate: yd.totalRate / yd.count
      };
      
      if (includeRegions) {
        trend.byRegion = {};
        Object.keys(yd.regions).forEach(region => {
          const rd = yd.regions[region];
          trend.byRegion![region] = rd.totalRate / rd.count;
        });
      }
      
      return trend;
    });
}

function getRegion(country: string): string {
  // Simple region mapping - can be enhanced with a proper mapping
  const countryLower = country.toLowerCase();
  if (['united states', 'canada', 'mexico'].some(c => countryLower.includes(c))) {
    return 'North America';
  }
  if (['united kingdom', 'france', 'germany', 'italy', 'spain', 'poland', 'russia'].some(c => countryLower.includes(c))) {
    return 'Europe';
  }
  if (['china', 'japan', 'south korea', 'india', 'thailand'].some(c => countryLower.includes(c))) {
    return 'Asia';
  }
  if (['australia', 'new zealand'].some(c => countryLower.includes(c))) {
    return 'Oceania';
  }
  if (['brazil', 'argentina', 'chile'].some(c => countryLower.includes(c))) {
    return 'South America';
  }
  return 'Other';
}

