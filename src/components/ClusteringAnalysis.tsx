import { Network, MapPin } from 'lucide-react';
import { SuicideData } from '../types';
import { kMeansClustering, ClusterResult } from '../utils/advancedAnalytics';
import { useState } from 'react';

interface ClusteringAnalysisProps {
  data: SuicideData[];
}

export function ClusteringAnalysis({ data }: ClusteringAnalysisProps) {
  const [numClusters, setNumClusters] = useState(3);
  
  let clusterResult: ClusterResult | null = null;
  try {
    clusterResult = kMeansClustering(data, numClusters);
  } catch (error) {
    console.error('Clustering error:', error);
  }

  const clusterColors = [
    { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-700', light: 'bg-blue-50' },
    { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-700', light: 'bg-red-50' },
    { bg: 'bg-green-500', border: 'border-green-600', text: 'text-green-700', light: 'bg-green-50' },
    { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-700', light: 'bg-yellow-50' },
    { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-700', light: 'bg-purple-50' },
    { bg: 'bg-pink-500', border: 'border-pink-600', text: 'text-pink-700', light: 'bg-pink-50' }
  ];

  // Group countries by cluster
  const countriesByCluster = clusterResult
    ? clusterResult.clusters.reduce((acc, clusterId, idx) => {
        if (!acc[clusterId]) {
          acc[clusterId] = [];
        }
        acc[clusterId].push(clusterResult!.countries[idx]);
        return acc;
      }, {} as Record<number, string[]>)
    : {};

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Country Clustering Analysis</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Clusters:</label>
          <select
            value={numClusters}
            onChange={(e) => setNumClusters(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          K-means clustering groups countries with similar suicide patterns based on average suicide rate,
          GDP per capita, and trend direction. This helps identify countries that may benefit from similar
          prevention strategies.
        </p>
      </div>

      {clusterResult ? (
        <>
          {/* Cluster Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(countriesByCluster).map(([clusterId, countries]) => {
              const clusterIdx = Number(clusterId);
              const color = clusterColors[clusterIdx % clusterColors.length];
              const centroid = clusterResult!.centroids[clusterIdx];
              
              return (
                <div
                  key={clusterId}
                  className={`border-2 ${color.border} rounded-lg p-4 ${color.light}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-4 h-4 rounded-full ${color.bg}`} />
                    <h3 className={`font-semibold ${color.text}`}>
                      Cluster {Number(clusterId) + 1}
                    </h3>
                    <span className="text-xs text-gray-500">
                      ({countries.length} countries)
                    </span>
                  </div>

                  {/* Cluster Characteristics */}
                  <div className="mb-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Rate:</span>
                      <span className="font-medium text-gray-900">
                        {centroid[0].toFixed(2)} per 100k
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GDP (k):</span>
                      <span className="font-medium text-gray-900">
                        ${centroid[1].toFixed(1)}k
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trend:</span>
                      <span className={`font-medium ${
                        centroid[2] > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {centroid[2] > 0 ? '↑ Increasing' : '↓ Decreasing'}
                      </span>
                    </div>
                  </div>

                  {/* Countries List */}
                  <div className="max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {countries.map((country) => (
                        <span
                          key={country}
                          className="inline-block px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                        >
                          {country}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cluster Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Cluster</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Countries</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Avg Rate</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Avg GDP</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Trend</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Characteristics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(countriesByCluster).map(([clusterId, countries]) => {
                  const clusterIdx = Number(clusterId);
                  const color = clusterColors[clusterIdx % clusterColors.length];
                  const centroid = clusterResult!.centroids[clusterIdx];
                  
                  const getCharacteristics = () => {
                    const rate = centroid[0];
                    const gdp = centroid[1];
                    const trend = centroid[2];
                    
                    let chars = [];
                    if (rate > 20) chars.push('High suicide rate');
                    else if (rate < 10) chars.push('Low suicide rate');
                    if (gdp > 30) chars.push('High GDP');
                    else if (gdp < 10) chars.push('Low GDP');
                    if (trend > 0.5) chars.push('Rising trend');
                    else if (trend < -0.5) chars.push('Declining trend');
                    
                    return chars.length > 0 ? chars.join(', ') : 'Mixed characteristics';
                  };

                  return (
                    <tr key={clusterId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                          <span className="font-medium text-gray-900">
                            Cluster {clusterIdx + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{countries.length}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {centroid[0].toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ${(centroid[1] * 1000).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          centroid[2] > 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {centroid[2] > 0 ? '↑' : '↓'} {Math.abs(centroid[2]).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getCharacteristics()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-900 mb-2">Clustering Insights</h3>
            <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
              <li>
                Countries within the same cluster share similar suicide patterns and may benefit from
                similar prevention strategies.
              </li>
              <li>
                Clusters with high suicide rates and rising trends require immediate intervention.
              </li>
              <li>
                Countries in clusters with low GDP but high suicide rates may need economic support
                as part of prevention efforts.
              </li>
            </ul>
          </div>
        </>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Insufficient data for clustering analysis. Please load more country data.
          </p>
        </div>
      )}
    </div>
  );
}

