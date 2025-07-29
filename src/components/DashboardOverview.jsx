import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Globe,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import apiService from '@/lib/api';
import GA4ConnectionCard from './GA4ConnectionCard';

export default function DashboardOverview({ website, onNavigateToGA4 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (website) {
      loadDashboardData();
    }
  }, [website]);

  const loadDashboardData = async () => {
    if (!website) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getDashboardData(website.id);
      setData(response);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading dashboard data: {error}</p>
            <Button onClick={loadDashboardData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Extract metrics from the overview data
  const overviewMetrics = data.overview?.rows?.[0]?.metric_values || [];
  const metricHeaders = data.overview?.metric_headers || [];
  
  const getMetricValue = (metricName) => {
    const index = metricHeaders.findIndex(h => h.name === metricName);
    return index !== -1 ? parseFloat(overviewMetrics[index]?.value || 0) : 0;
  };

  const activeUsers = getMetricValue('activeUsers');
  const sessions = getMetricValue('sessions');
  const screenPageViews = getMetricValue('screenPageViews');
  const bounceRate = getMetricValue('bounceRate');
  const avgSessionDuration = getMetricValue('averageSessionDuration');

  // Real-time data
  const realtimeUsers = data.realtime?.rows?.[0]?.metric_values?.[0]?.value || 0;

  // Traffic sources data for pie chart
  const trafficSources = data.traffic_sources?.rows?.map(row => ({
    name: row.dimension_values[0].value,
    value: parseInt(row.metric_values[0].value),
    users: parseInt(row.metric_values[1]?.value || 0)
  })) || [];

  // Top pages data
  const topPages = data.page_performance?.rows?.slice(0, 5).map(row => ({
    page: row.dimension_values[0].value,
    views: parseInt(row.metric_values[0].value),
    sessions: parseInt(row.metric_values[1]?.value || 0),
    engagement: parseFloat(row.metric_values[2]?.value || 0),
    bounce: parseFloat(row.metric_values[3]?.value || 0)
  })) || [];

  const COLORS = {
    traffic: 'var(--color-traffic)',
    pages: 'var(--color-pages)', 
    engagement: 'var(--color-engagement)',
    realtime: 'var(--color-realtime)'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Analytics Overview</h3>
          <p className="text-muted-foreground">
            Last 30 days • Updated {lastUpdated?.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onNavigateToGA4} 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            GA4 Dashboard
          </Button>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Users - Traffic Category (Green) */}
        <Card className="border-l-4" style={{ borderLeftColor: COLORS.traffic }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4" style={{ color: COLORS.traffic }} />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Last 30 days
            </p>
          </CardContent>
        </Card>

        {/* Sessions - Traffic Category (Green) */}
        <Card className="border-l-4" style={{ borderLeftColor: COLORS.traffic }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MousePointer className="mr-2 h-4 w-4" style={{ color: COLORS.traffic }} />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(sessions)}</div>
            <p className="text-xs text-muted-foreground">
              Total user sessions
            </p>
          </CardContent>
        </Card>

        {/* Page Views - Pages Category (Orange) */}
        <Card className="border-l-4" style={{ borderLeftColor: COLORS.pages }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="mr-2 h-4 w-4" style={{ color: COLORS.pages }} />
              Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(screenPageViews)}</div>
            <p className="text-xs text-muted-foreground">
              Total page views
            </p>
          </CardContent>
        </Card>

        {/* Real-time Users - Realtime Category (Purple) */}
        <Card className="border-l-4" style={{ borderLeftColor: COLORS.realtime }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span style={{ color: COLORS.realtime }}>Live Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active right now
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" style={{ color: COLORS.engagement }} />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg. Session Duration</span>
              <span className="font-medium">{formatDuration(avgSessionDuration)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bounce Rate</span>
              <Badge variant={bounceRate > 0.6 ? "destructive" : "secondary"}>
                {formatPercentage(bounceRate)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pages per Session</span>
              <span className="font-medium">
                {sessions > 0 ? (screenPageViews / sessions).toFixed(1) : '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" style={{ color: COLORS.traffic }} />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={Object.values(COLORS)[index % Object.values(COLORS).length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatNumber(value), 'Sessions']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {trafficSources.slice(0, 4).map((source, index) => (
                <div key={source.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length] }}
                    ></div>
                    <span>{source.name}</span>
                  </div>
                  <span className="font-medium">{formatNumber(source.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" style={{ color: COLORS.pages }} />
            Top Pages
          </CardTitle>
          <CardDescription>Most viewed pages in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{page.page}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(page.sessions)} sessions • {formatPercentage(page.bounce)} bounce rate
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: COLORS.pages }}>
                    {formatNumber(page.views)}
                  </div>
                  <div className="text-xs text-muted-foreground">views</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* GA4 Connection Section */}
      <GA4ConnectionCard />
    </div>
  );
}
