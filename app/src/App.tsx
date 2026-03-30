import React, { useState, useEffect } from 'react';
import { fetchTeamPerformance } from './api/mockData';
import { TeamPerformanceResponseDto } from './types';
import { batterMetrics, pitcherMetrics, defenseMetrics, MetricConfig } from './config/metrics';
import { Activity, Shield, TrendingUp, Info } from 'lucide-react';
import { cn } from './lib/utils';

type TabType = 'batter' | 'pitcher' | 'defense';

function App() {
  const [data, setData] = useState<TeamPerformanceResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('batter');

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchTeamPerformance();
        setData(result);
        if (result.length > 0) {
          setSelectedTeamId(result[0].teamId);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedTeam = data.find(t => t.teamId === selectedTeamId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">데이터가 없습니다.</p>
      </div>
    );
  }

  const renderMetricsSection = (title: string, metrics: MetricConfig[], teamData: TeamPerformanceResponseDto) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-600 rounded-sm inline-block"></span>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{metric.column}</p>
                <h4 className="text-lg font-bold text-gray-900">{metric.name}</h4>
              </div>
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-lg font-bold">
                {metric.format(teamData[metric.key] as number)}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-start gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
              <p className="leading-snug">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const getActiveMetrics = () => {
    switch (activeTab) {
      case 'batter': return batterMetrics;
      case 'pitcher': return pitcherMetrics;
      case 'defense': return defenseMetrics;
    }
  };

  const activeMetrics = getActiveMetrics();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">KBO 팀 기록실</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <label htmlFor="team-select" className="text-sm font-medium text-gray-600">팀 선택:</label>
            <select
              id="team-select"
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border bg-white"
              value={selectedTeamId || ''}
              onChange={(e) => setSelectedTeamId(Number(e.target.value))}
            >
              {data.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{selectedTeam.teamName}</h2>
            <p className="text-sm text-gray-500 mt-1">기준일: {selectedTeam.baseDate}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('batter')}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                activeTab === 'batter'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              팀 타자 지표
            </button>
            <button
              onClick={() => setActiveTab('pitcher')}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                activeTab === 'pitcher'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Activity className="w-4 h-4" />
              팀 투수 지표
            </button>
            <button
              onClick={() => setActiveTab('defense')}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                activeTab === 'defense'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Shield className="w-4 h-4" />
              팀 수비 및 주루 지표
            </button>
          </nav>
        </div>

        {/* Metrics Content */}
        <div className="space-y-12 animate-in fade-in duration-500">
          {renderMetricsSection('일반 지표', activeMetrics.general, selectedTeam)}
          {renderMetricsSection('심화 지표', activeMetrics.advanced, selectedTeam)}
        </div>
      </main>
    </div>
  );
}

export default App;
