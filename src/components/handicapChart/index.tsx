"use client";

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardBody, Spinner } from '@heroui/react';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HandicapData {
  date: string;
  value: number;
  campaignId: string;
}

interface HandicapsByCampaign {
  [campaignName: string]: HandicapData[];
}

interface HandicapChartProps {
  playerId: string;
}

const colors = [
  'rgb(59, 130, 246)', // blue
  'rgb(16, 185, 129)', // green  
  'rgb(245, 101, 101)', // red
  'rgb(139, 92, 246)', // purple
  'rgb(249, 115, 22)', // orange
  'rgb(236, 72, 153)', // pink
  'rgb(14, 165, 233)', // sky
  'rgb(34, 197, 94)', // emerald
];

const HandicapChart: React.FC<HandicapChartProps> = ({ playerId }) => {
  const [handicapData, setHandicapData] = useState<HandicapsByCampaign>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHandicapData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/players/${playerId}/handicaps`);
        if (!response.ok) {
          throw new Error('Failed to fetch handicap data');
        }
        const data = await response.json();
        setHandicapData(data.handicapsByCampaign);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHandicapData();
  }, [playerId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardBody className="p-8">
          <div className="flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardBody className="p-8">
          <div className="text-center text-red-600">
            <p>Error loading handicap data: {error}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const campaignNames = Object.keys(handicapData);
  
  if (campaignNames.length === 0) {
    return (
      <Card className="w-full">
        <CardBody className="p-8">
          <div className="text-center text-gray-500">
            <p>No handicap data available</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Create datasets for each campaign
  const datasets = campaignNames.map((campaignName, index) => {
    const campaignHandicaps = handicapData[campaignName].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const color = colors[index % colors.length];
    
    return {
      label: campaignName,
      data: campaignHandicaps.map(h => ({
        x: format(new Date(h.date), 'yyyy-MM-dd'),
        y: h.value
      })),
      borderColor: color,
      backgroundColor: color + '20', // Add transparency
      fill: false,
      tension: 0.2,
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });

  // Get all unique dates for the x-axis
  const allDates = Array.from(new Set(
    campaignNames.flatMap(name => 
      handicapData[name].map(h => format(new Date(h.date), 'yyyy-MM-dd'))
    )
  )).sort();

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Handicap Progress Over Time',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Handicap Value'
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        suggestedMin: 0,
        suggestedMax: Math.max(
          ...campaignNames.flatMap(name => 
            handicapData[name].map(h => h.value)
          )
        ) + 5
      },
    },
  };

  const chartData = {
    labels: allDates,
    datasets: datasets
  };

  return (
    <Card className="w-full">
      <CardBody className="p-6">
        <div className="h-96 w-full">
          <Line data={chartData} options={options} />
        </div>
      </CardBody>
    </Card>
  );
};

export default HandicapChart;