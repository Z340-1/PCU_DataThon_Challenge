import { Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { SuicideData } from '../types';
import { multipleLinearRegression, RegressionModel } from '../utils/advancedAnalytics';
import { useState } from 'react';

interface RegressionModelProps {
  data: SuicideData[];
}

export function RegressionModelPanel({ data }: RegressionModelProps) {
  const [selectedPredictors, setSelectedPredictors] = useState<string[]>([
    'gdp_per_capita',
    'year',
    'sex_male',
    'age_35_54'
  ]);

  const availablePredictors = [
    { id: 'gdp_per_capita', label: 'GDP per Capita' },
    { id: 'year', label: 'Year' },
    { id: 'population', label: 'Population (log)' },
    { id: 'sex_male', label: 'Sex (Male)' },
    { id: 'age_15_24', label: 'Age 15-24' },
    { id: 'age_25_34', label: 'Age 25-34' },
    { id: 'age_35_54', label: 'Age 35-54' },
    { id: 'age_55_74', label: 'Age 55-74' },
    { id: 'age_75_plus', label: 'Age 75+' }
  ];

  const togglePredictor = (predictorId: string) => {
    if (selectedPredictors.includes(predictorId)) {
      setSelectedPredictors(selectedPredictors.filter(p => p !== predictorId));
    } else {
      setSelectedPredictors([...selectedPredictors, predictorId]);
    }
  };

  let model: RegressionModel | null = null;
  if (selectedPredictors.length > 0 && data.length > selectedPredictors.length) {
    try {
      model = multipleLinearRegression(data, selectedPredictors);
    } catch (error) {
      console.error('Regression error:', error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Multiple Regression Model</h2>
      </div>

      {/* Predictor Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Predictors</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availablePredictors.map(predictor => (
            <label
              key={predictor.id}
              className="flex items-center gap-2 p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedPredictors.includes(predictor.id)}
                onChange={() => togglePredictor(predictor.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{predictor.label}</span>
            </label>
          ))}
        </div>
      </div>

      {model ? (
        <>
          {/* Model Performance */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">Model Performance</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-blue-600 mb-1">R² (Coefficient of Determination)</div>
                <div className="text-2xl font-bold text-blue-900">
                  {(model.rSquared * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {model.rSquared > 0.7 ? 'Strong fit' : model.rSquared > 0.4 ? 'Moderate fit' : 'Weak fit'}
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-600 mb-1">Intercept</div>
                <div className="text-2xl font-bold text-blue-900">
                  {model.intercept.toFixed(2)}
                </div>
                <div className="text-xs text-blue-600 mt-1">Base prediction value</div>
              </div>
            </div>
          </div>

          {/* Coefficients */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Coefficients</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(model.coefficients).map(([predictor, coefficient]) => {
                const predictorLabel = availablePredictors.find(p => p.id === predictor)?.label || predictor;
                const isPositive = coefficient > 0;
                return (
                  <div
                    key={predictor}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isPositive ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{predictorLabel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${
                        isPositive ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {coefficient > 0 ? '+' : ''}{coefficient.toFixed(4)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {isPositive ? '↑ Increases' : '↓ Decreases'} rate
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interpretation */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Model Interpretation</h3>
            <div className="text-xs text-gray-700 space-y-1">
              <p>
                <strong>R² = {(model.rSquared * 100).toFixed(2)}%:</strong> This model explains{' '}
                {(model.rSquared * 100).toFixed(2)}% of the variance in suicide rates.
              </p>
              <p>
                <strong>Coefficients:</strong> Positive coefficients indicate that an increase in the
                predictor variable is associated with higher suicide rates, while negative coefficients
                indicate the opposite.
              </p>
              <p>
                <strong>Prediction Formula:</strong> Suicide Rate = {model.intercept.toFixed(2)} +{' '}
                {Object.entries(model.coefficients)
                  .map(([pred, coef]) => {
                    const label = availablePredictors.find(p => p.id === pred)?.label || pred;
                    return `${coef > 0 ? '+' : ''}${coef.toFixed(4)} × ${label}`;
                  })
                  .join(' + ')}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {selectedPredictors.length === 0
              ? 'Please select at least one predictor variable.'
              : 'Insufficient data to build regression model. Need more data points than predictors.'}
          </p>
        </div>
      )}
    </div>
  );
}

