import { MetricCard } from '@/components/dashboard/MetricCard';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Mail,
  Video,
  Target,
  TrendingUp,
  Activity,
  Calendar,
  Upload,
} from 'lucide-react';
import { 
  mockAIInsights, 
  linkedInTrendData, 
  emailTrendData, 
  industryData,
  mockUploadedDatasets 
} from '@/lib/mockData';
import { motion } from 'framer-motion';

export function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div 
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
          <p className="text-muted-foreground">
            Track your campaigns and AI-powered insights
          </p>
        </div>
        <Button>
          <Activity className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Key Metrics */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        <MetricCard
          title="LinkedIn Requests"
          value="847"
          change={{ value: 5.2, trend: 'up' }}
          icon={Users}
        />
        <MetricCard
          title="Email Campaigns"
          value="2,341"
          change={{ value: 12.1, trend: 'up' }}
          icon={Mail}
        />
        <MetricCard
          title="Webinar Invites"
          value="1,250"
          change={{ value: 8.7, trend: 'up' }}
          icon={Video}
        />
        <MetricCard
          title="Total ROI"
          value="324%"
          change={{ value: 15.3, trend: 'up' }}
          icon={Target}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts Section */}
        <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>LinkedIn Acceptance Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AreaChart
                data={linkedInTrendData}
                xKey="week"
                yKey="acceptanceRate"
                color="#06B6D4"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={emailTrendData}
                xKey="week"
                lines={[
                  { key: 'openRate', color: '#10B981', name: 'Open Rate' },
                  { key: 'replyRate', color: '#F59E0B', name: 'Reply Rate' },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Industry Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={industryData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* AI Insights */}
          <AIInsightCard insight={mockAIInsights[0]} />

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">New dataset uploaded</p>
                  <p className="text-muted-foreground">Q4_LinkedIn_Prospects.csv</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">Webinar scheduled</p>
                  <p className="text-muted-foreground">AI Transformation - Feb 15</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">AI report generated</p>
                  <p className="text-muted-foreground">Weekly summary available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Dataset
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Webinar
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Generate AI Report
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}