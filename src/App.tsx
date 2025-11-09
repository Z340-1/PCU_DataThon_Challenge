import { useState } from 'react';
import { Activity } from 'lucide-react';
import { SuicideData } from './types';
import { DataUpload } from './components/DataUpload';
import { StatisticsPanel } from './components/StatisticsPanel';
import { VisualizationCharts } from './components/VisualizationCharts';
import { CorrelationAnalysis } from './components/CorrelationAnalysis';
import { ForecastPanel } from './components/ForecastPanel';
import { DataTable } from './components/DataTable';
import { TopCountriesAnalysis } from './components/TopCountriesAnalysis';
import { TrendAnalysis } from './components/TrendAnalysis';
import { RegressionModelPanel } from './components/RegressionModel';
import { GenerationCohortAnalysis } from './components/GenerationCohortAnalysis';
import { ClusteringAnalysis } from './components/ClusteringAnalysis';
import { SummaryReport } from './components/SummaryReport';

function App() {
  const [data, setData] = useState<SuicideData[]>([]);

  const handleDataLoad = (loadedData: SuicideData[]) => {
    setData(loadedData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Global Suicide Rate Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Trend Analysis and Socioeconomic Correlation Platform
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <DataUpload onDataLoad={handleDataLoad} />

          {data.length > 0 && (
            <>
              <StatisticsPanel data={data} />

              <TopCountriesAnalysis data={data} />

              <TrendAnalysis data={data} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VisualizationCharts data={data} />
                <CorrelationAnalysis data={data} />
              </div>

              <RegressionModelPanel data={data} />

              <GenerationCohortAnalysis data={data} />

              <ClusteringAnalysis data={data} />

              <ForecastPanel data={data} />

              <SummaryReport data={data} />

              <DataTable data={data} />
            </>
          )}

          {data.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Data Loaded
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Upload a CSV file with suicide rate data or load sample data to begin
                your analysis. The platform will automatically clean and analyze the data.
              </p>
            </div>
          )}
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            Global Suicide Rate Trend Analysis © 2025 | Data-driven insights for prevention programs
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
