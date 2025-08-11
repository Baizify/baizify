'use client'

import { Card, CardBody, CardHeader, Spinner, Select, SelectItem } from "@heroui/react";
import { FaChartLine, FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LeagueHistoryData {
  teamId: string;
  teamName: string;
  history: Array<{
    competitionId: string;
    seasonId: string;
    competition: {
      name: string;
      sortOrder: number;
      collection: string;
    };
    season: {
      name: string;
      startDate?: string;
      endDate?: string;
    };
    snapshots: Array<{
      position: number;
      points: number;
      snapshotDate: string;
    }>;
    hierarchy: {
      divisionAbove?: { name: string; sortOrder: number } | null;
      divisionBelow?: { name: string; sortOrder: number } | null;
    };
  }>;
  competitionHierarchy: Record<string, Array<{
    id: string;
    name: string;
    sortOrder: number;
    collection: string;
  }>>;
  summary: {
    totalSeasons: number;
    collectionsPlayed: number;
    highestDivision: number;
    lowestDivision: number;
    bestPosition: number;
    promotions: number;
    relegations: number;
  };
}

const LeaguePositionChart = ({ teamId }: { teamId: string }) => {
  const [historyData, setHistoryData] = useState<LeagueHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string>('');

  useEffect(() => {
    const fetchLeagueHistory = async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}/league-history`);
        if (response.ok) {
          const data = await response.json();
          setHistoryData(data);
          
          // Set default collection to the first one
          const collections = Object.keys(data.competitionHierarchy);
          if (collections.length > 0) {
            setSelectedCollection(collections[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching league history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueHistory();
  }, [teamId]);

  if (loading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (!historyData || historyData.history.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <FaChartLine size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No League History</h3>
          <p className="text-gray-500">No league position data available for this team.</p>
        </CardBody>
      </Card>
    );
  }

  // Filter history by selected collection
  const filteredHistory = selectedCollection 
    ? historyData.history.filter(h => h.competition.collection === selectedCollection)
    : historyData.history;

  if (filteredHistory.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-500">No data for selected collection.</p>
        </CardBody>
      </Card>
    );
  }

  // Prepare chart data
  const chartLabels: string[] = [];
  const positionData: (number | null)[] = [];
  const divisionData: { [key: string]: (number | null)[] } = {};

  // Create a continuous timeline
  filteredHistory.forEach((seasonHistory, seasonIndex) => {
    seasonHistory.snapshots.forEach((snapshot, snapshotIndex) => {
      const label = `${seasonHistory.season.name}${snapshot.snapshotDate ? ` (${new Date(snapshot.snapshotDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })})` : ''}`;
      chartLabels.push(label);
      
      // Invert position for better visualization (1st place at top of chart)
      positionData.push(-snapshot.position);

      // Add division reference lines
      const hierarchy = seasonHistory.hierarchy;
      if (hierarchy.divisionAbove) {
        const aboveKey = `${hierarchy.divisionAbove.name} (Above)`;
        if (!divisionData[aboveKey]) divisionData[aboveKey] = new Array(chartLabels.length - 1).fill(null);
        divisionData[aboveKey].push(-1); // Top position of division above
      }

      if (hierarchy.divisionBelow) {
        const belowKey = `${hierarchy.divisionBelow.name} (Below)`;
        if (!divisionData[belowKey]) divisionData[belowKey] = new Array(chartLabels.length - 1).fill(null);
        divisionData[belowKey].push(-20); // Bottom position of division below (assuming 20 teams max)
      }
    });
  });

  // Fill missing values in division data
  Object.keys(divisionData).forEach(key => {
    while (divisionData[key].length < chartLabels.length) {
      divisionData[key].push(null);
    }
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `${historyData.teamName} League Position`,
        data: positionData,
        borderColor: 'rgb(59, 130, 246)', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.1,
        fill: false,
      },
      // Add division reference lines
      ...Object.entries(divisionData).map(([name, data], index) => ({
        label: name,
        data,
        borderColor: name.includes('Above') ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)', // Green for above, red for below
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5], // Dotted line
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        fill: false,
      }))
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          filter: (legendItem) => legendItem.text !== undefined
        }
      },
      title: {
        display: true,
        text: `${historyData.teamName} - League Position History`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 0) {
              const position = Math.abs(context.raw as number);
              const suffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';
              return `Position: ${position}${suffix}`;
            }
            return context.dataset.label || '';
          }
        }
      }
    },
    scales: {
      y: {
        reverse: true, // Higher positions (lower numbers) at top
        title: {
          display: true,
          text: 'League Position'
        },
        ticks: {
          callback: function(value) {
            const pos = Math.abs(value as number);
            if (pos <= 20 && pos % 1 === 0) { // Only show integer positions up to 20
              const suffix = pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th';
              return `${pos}${suffix}`;
            }
            return '';
          }
        },
        min: -20,
        max: -1
      },
      x: {
        title: {
          display: true,
          text: 'Season / Date'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Calculate movement indicators
  const getMovementIcon = (current: number, previous: number) => {
    if (current < previous) return <FaArrowUp className="text-green-500" size={14} />;
    if (current > previous) return <FaArrowDown className="text-red-500" size={14} />;
    return <FaMinus className="text-gray-400" size={14} />;
  };

  const collections = Object.keys(historyData.competitionHierarchy);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardBody className="text-center p-4">
            <p className="text-2xl font-bold text-blue-600">{historyData.summary.totalSeasons}</p>
            <p className="text-sm text-gray-600">Seasons</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center p-4">
            <p className="text-2xl font-bold text-green-600">{historyData.summary.bestPosition}</p>
            <p className="text-sm text-gray-600">Best Position</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center p-4">
            <p className="text-2xl font-bold text-yellow-600">{historyData.summary.promotions}</p>
            <p className="text-sm text-gray-600">Promotions</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center p-4">
            <p className="text-2xl font-bold text-red-600">{historyData.summary.relegations}</p>
            <p className="text-sm text-gray-600">Relegations</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center p-4">
            <p className="text-2xl font-bold text-purple-600">{historyData.summary.collectionsPlayed}</p>
            <p className="text-sm text-gray-600">Leagues</p>
          </CardBody>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">League Position History</h3>
          {collections.length > 1 && (
            <Select 
              size="sm"
              placeholder="Select league"
              selectedKeys={selectedCollection ? [selectedCollection] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                setSelectedCollection(selectedKey);
              }}
              className="w-64"
            >
              {collections.map((collection) => (
                <SelectItem key={collection} value={collection}>
                  {collection}
                </SelectItem>
              ))}
            </Select>
          )}
        </CardHeader>
        <CardBody>
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardBody>
      </Card>

      {/* Recent Form */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Season Summary</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {filteredHistory.slice(-5).map((season, index) => {
              const lastSnapshot = season.snapshots[season.snapshots.length - 1];
              const firstSnapshot = season.snapshots[0];
              const movement = lastSnapshot && firstSnapshot ? lastSnapshot.position - firstSnapshot.position : 0;
              
              return (
                <div key={season.seasonId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{season.season.name}</p>
                    <p className="text-sm text-gray-600">{season.competition.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">{lastSnapshot?.position || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Final Position</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {movement !== 0 && getMovementIcon(lastSnapshot?.position || 0, firstSnapshot?.position || 0)}
                      <span className="text-sm text-gray-600">
                        {Math.abs(movement) > 0 ? `${Math.abs(movement)} places` : 'No change'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default LeaguePositionChart;