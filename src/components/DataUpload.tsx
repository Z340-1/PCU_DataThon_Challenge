import { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { SuicideData } from '../types';
import { cleanData } from '../utils/statistics';

interface DataUploadProps {
  onDataLoad: (data: SuicideData[]) => void;
}

export function DataUpload({ onDataLoad }: DataUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('File must contain header and data rows');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row);
        }
      }

      const cleanedData = cleanData(data);

      if (cleanedData.length === 0) {
        throw new Error('No valid data found after cleaning');
      }

      onDataLoad(cleanedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setFileName(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleData = () => {
    const sampleData: SuicideData[] = [
      {
        id: '1',
        country: 'United States',
        year: 2015,
        sex: 'male',
        age: '15-24 years',
        suicides_no: 3500,
        population: 21000000,
        suicides_per_100k: 16.67,
        gdp_per_capita: 56000,
        generation: 'Generation Z'
      },
      {
        id: '2',
        country: 'United States',
        year: 2015,
        sex: 'female',
        age: '15-24 years',
        suicides_no: 1200,
        population: 20000000,
        suicides_per_100k: 6.0,
        gdp_per_capita: 56000,
        generation: 'Generation Z'
      },
      {
        id: '3',
        country: 'Japan',
        year: 2015,
        sex: 'male',
        age: '25-34 years',
        suicides_no: 4200,
        population: 8000000,
        suicides_per_100k: 52.5,
        gdp_per_capita: 40000,
        generation: 'Millennials'
      },
      {
        id: '4',
        country: 'Japan',
        year: 2016,
        sex: 'male',
        age: '25-34 years',
        suicides_no: 4000,
        population: 8000000,
        suicides_per_100k: 50.0,
        gdp_per_capita: 41000,
        generation: 'Millennials'
      },
      {
        id: '5',
        country: 'Germany',
        year: 2015,
        sex: 'male',
        age: '35-54 years',
        suicides_no: 2800,
        population: 15000000,
        suicides_per_100k: 18.67,
        gdp_per_capita: 47000,
        generation: 'Generation X'
      }
    ];

    onDataLoad(sampleData);
    setFileName('sample-data.csv');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Data Upload</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={loading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <FileText className="w-12 h-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-gray-500">CSV file with suicide data</div>
          </label>
        </div>

        {fileName && !error && (
          <div className="text-sm text-green-600 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Loaded: {fileName}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-300" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">Or</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <button
          onClick={handleSampleData}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          Load Sample Data
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p className="font-medium">Expected CSV columns:</p>
        <p className="font-mono">country, year, sex, age, suicides_no, population, suicides_per_100k, gdp_per_capita, generation</p>
      </div>
    </div>
  );
}
