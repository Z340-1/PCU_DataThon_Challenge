import { FileText, AlertTriangle, TrendingUp, Users, Globe, Target } from 'lucide-react';
import { SuicideData } from '../types';
import { getTopCountries, analyzeGenerations, calculateYearTrends, kMeansClustering } from '../utils/advancedAnalytics';
import { analyzeCorrelations } from '../utils/statistics';
import { calculateStatistics } from '../utils/statistics';

interface SummaryReportProps {
  data: SuicideData[];
}

export function SummaryReport({ data }: SummaryReportProps) {
  if (data.length === 0) {
    return null;
  }

  // Calculate key metrics
  const stats = calculateStatistics(data.map(d => d.suicides_per_100k));
  const { highest, lowest } = getTopCountries(data, 5);
  const generationStats = analyzeGenerations(data);
  const trends = calculateYearTrends(data);
  const correlations = analyzeCorrelations(data);
  
  // Get cluster insights
  let clusterInsight = '';
  try {
    const clusters = kMeansClustering(data, 3);
    const clusterCounts = clusters.clusters.reduce((acc, c) => {
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    clusterInsight = `Identified ${Object.keys(clusterCounts).length} distinct country clusters with similar suicide patterns.`;
  } catch (error) {
    clusterInsight = 'Clustering analysis requires more data.';
  }

  // Trend analysis
  const firstRate = trends[0]?.globalRate || 0;
  const lastRate = trends[trends.length - 1]?.globalRate || 0;
  const trendDirection = lastRate > firstRate ? 'increasing' : 'decreasing';
  const trendPercent = firstRate > 0 
    ? Math.abs(((lastRate - firstRate) / firstRate) * 100)
    : 0;

  // GDP correlation
  const gdpCorrelation = correlations.find(c => 
    c.variable1 === 'Suicide Rate' && c.variable2 === 'GDP per Capita'
  );

  // Highest risk generation
  const highestRiskGen = generationStats.length > 0 ? generationStats[0] : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Summary Report & Recommendations</h2>
      </div>

      {/* Executive Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <h3 className="text-md font-semibold text-gray-900 mb-3">Executive Summary</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            This analysis examined <strong>{data.length.toLocaleString()}</strong> data points across{' '}
            <strong>{new Set(data.map(d => d.country)).size}</strong> countries from{' '}
            <strong>{Math.min(...data.map(d => d.year))}</strong> to{' '}
            <strong>{Math.max(...data.map(d => d.year))}</strong>.
          </p>
          <p>
            The global average suicide rate is <strong>{stats.mean.toFixed(2)} per 100,000</strong> population,
            with rates ranging from <strong>{stats.min.toFixed(2)}</strong> to <strong>{stats.max.toFixed(2)}</strong>.
          </p>
          <p>
            Overall trend shows a <strong className={trendDirection === 'increasing' ? 'text-red-700' : 'text-green-700'}>
              {trendDirection} pattern
            </strong> with a <strong>{trendPercent.toFixed(1)}%</strong> change over the study period.
          </p>
        </div>
      </div>

      {/* Key Findings */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="text-md font-semibold text-gray-900">Key Findings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Geographic Patterns</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>
                <strong>{highest[0]?.country}</strong> has the highest average rate at{' '}
                {highest[0]?.avgRate.toFixed(2)} per 100k
              </li>
              <li>
                <strong>{lowest[0]?.country}</strong> has the lowest average rate at{' '}
                {lowest[0]?.avgRate.toFixed(2)} per 100k
              </li>
              <li>{clusterInsight}</li>
            </ul>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Demographic Patterns</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>
                {highestRiskGen ? (
                  <>
                    <strong>{highestRiskGen.generation}</strong> shows the highest risk with{' '}
                    {highestRiskGen.avgRate.toFixed(2)} per 100k
                  </>
                ) : (
                  'Insufficient generation data available'
                )}
              </li>
              <li>
                {generationStats.length > 0 ? (
                  <>
                    Significant variation exists across generation cohorts, with a{' '}
                    {(Math.max(...generationStats.map(g => g.avgRate)) - 
                      Math.min(...generationStats.map(g => g.avgRate))).toFixed(2)} per 100k difference
                  </>
                ) : (
                  'Insufficient generation data for comparison'
                )}
              </li>
            </ul>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-gray-900">Socioeconomic Factors</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>
                GDP per capita correlation: <strong>{gdpCorrelation?.coefficient.toFixed(3)}</strong>{' '}
                ({gdpCorrelation?.strength || 'N/A'})
              </li>
              <li>
                {gdpCorrelation && Math.abs(gdpCorrelation.coefficient) > 0.3
                  ? 'Economic factors show significant correlation with suicide rates'
                  : 'Economic factors show weak correlation with suicide rates'}
              </li>
            </ul>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-red-600" />
              <h4 className="font-semibold text-gray-900">Trend Analysis</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>
                Global trend is <strong>{trendDirection}</strong> by {trendPercent.toFixed(1)}%
              </li>
              <li>
                Current rate: <strong>{lastRate.toFixed(2)}</strong> per 100k
              </li>
              <li>
                Historical range: {stats.min.toFixed(2)} - {stats.max.toFixed(2)} per 100k
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-md font-semibold text-gray-900">Data-Driven Recommendations</h3>
        </div>
        
        <div className="space-y-4">
          {/* Global Recommendations */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Global Prevention Strategies</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                Implement comprehensive mental health screening programs, especially in countries
                with rates above {stats.mean.toFixed(2)} per 100k
              </li>
              <li>
                Strengthen crisis intervention services and suicide prevention hotlines globally
              </li>
              <li>
                Develop cross-country collaboration programs to share successful prevention strategies
              </li>
              <li>
                {trendDirection === 'increasing' 
                  ? 'Urgent action needed: Global rates are increasing, requiring immediate intervention'
                  : 'Maintain current prevention efforts while monitoring for emerging risk factors'}
              </li>
            </ul>
          </div>

          {/* Regional Recommendations */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Regional & Country-Specific Actions</h4>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>
                <strong>High-Risk Countries:</strong> {highest.length > 0 
                  ? `${highest.slice(0, 3).map(c => c.country).join(', ')} require immediate intervention with evidence-based prevention programs`
                  : 'No high-risk countries identified'}
              </li>
              <li>
                <strong>Low-Risk Countries:</strong> {lowest.length > 0
                  ? `Study prevention strategies from ${lowest.slice(0, 3).map(c => c.country).join(', ')} to identify best practices`
                  : 'No low-risk countries identified'}
              </li>
              <li>
                Countries in similar clusters should collaborate on shared prevention strategies
              </li>
              <li>
                Economic support programs may be needed in countries with high rates and low GDP
              </li>
            </ul>
          </div>

          {/* Demographic Recommendations */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Generation-Specific Interventions</h4>
            <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
              <li>
                {highestRiskGen ? (
                  <>
                    <strong>{highestRiskGen.generation}:</strong> Highest risk cohort requires targeted
                    prevention programs addressing generation-specific stressors
                  </>
                ) : (
                  'Develop targeted prevention programs for high-risk generation cohorts'
                )}
              </li>
              <li>
                Develop age-appropriate mental health resources and support systems for each generation
              </li>
              <li>
                Implement workplace mental health programs, especially for working-age generations
              </li>
              <li>
                Create peer support networks and community-based interventions tailored to each cohort
              </li>
            </ul>
          </div>

          {/* Research Recommendations */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Research & Monitoring Priorities</h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>
                Continue monitoring trends to identify emerging risk factors and changing patterns
              </li>
              <li>
                Investigate the relationship between economic indicators and suicide rates more deeply
              </li>
              <li>
                Study successful prevention programs in low-rate countries to identify transferable strategies
              </li>
              <li>
                Develop predictive models to identify at-risk populations before crises occur
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Immediate Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
            <span className="text-sm text-gray-700">
              Prioritize intervention in top 10 highest-risk countries
            </span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
            <span className="text-sm text-gray-700">
              {highestRiskGen 
                ? `Develop targeted programs for ${highestRiskGen.generation} generation`
                : 'Develop targeted programs for high-risk generation cohorts'}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
            <span className="text-sm text-gray-700">
              Strengthen economic support in high-risk, low-GDP regions
            </span>
          </div>
        </div>
      </div>

      {/* Report Metadata */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p>
          Report generated on {new Date().toLocaleDateString()} | 
          Data points: {data.length.toLocaleString()} | 
          Countries: {new Set(data.map(d => d.country)).size} | 
          Years: {Math.min(...data.map(d => d.year))} - {Math.max(...data.map(d => d.year))}
        </p>
      </div>
    </div>
  );
}

