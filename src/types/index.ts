export interface SuicideData {
  id: string;
  country: string;
  year: number;
  sex: string;
  age: string;
  suicides_no: number;
  population: number;
  suicides_per_100k: number;
  gdp_per_capita: number;
  generation: string;
}

export interface CountryMetadata {
  country: string;
  region: string;
  income_group: string;
}

export interface Statistics {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  total: number;
}

export interface CorrelationResult {
  variable1: string;
  variable2: string;
  coefficient: number;
  strength: string;
}

export interface ForecastPoint {
  year: number;
  predicted: number;
  confidence_low: number;
  confidence_high: number;
}
