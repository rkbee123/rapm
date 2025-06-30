import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Brain, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const otherCampaigns = [
  {
    id: '1',
    name: 'Google Ads - SaaS Keywords',
    type: 'Paid Advertising',
    status: 'active',
    budget: 5000,
    spent: 3200,
    impressions: 45000,
    clicks: 892,
    conversions: 23,
    roi: 245,
  },
  {
    id: '2',
    name: 'Content Partnership - TechCrunch',
    type: 'Content Marketing',
    status: 'completed',
    budget: 8000,
    spent: 8000,
    impressions: 120000,
    clicks: 2400,
    conversions: 87,
    roi: 380,
  },
  {
    id: '3',
    name: 'Trade Show - SaaS Summit 2024',
    type: 'Event Marketing',
    status: 'upcoming',
    budget: 15000,
    spent: 4500,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    roi: 0,
  },
];

export function OtherCampaigns() {
  const totalBudget = otherCampaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const totalSpent = otherCampaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalConversions = otherCampaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
  const avgROI = otherCampaigns.reduce((sum, campaign) => sum + campaign.roi, 0) / otherCampaigns.length;

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Other Marketing Campaigns</h1>
          <p className="text-muted-foreground">
            Track advertising, content partnerships, and event marketing
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            AI Campaign Analysis
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Campaign
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <Progress value={(totalSpent / totalBudget) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalConversions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgROI.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {otherCampaigns.map((campaign) => (
          <Card key={campaign.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <Badge
                  variant={
                    campaign.status === 'active'
                      ? 'default'
                      : campaign.status === 'completed'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{campaign.type}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Utilization</span>
                  <span>{((campaign.spent / campaign.budget) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(campaign.spent / campaign.budget) * 100} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${campaign.spent.toLocaleString()} spent</span>
                  <span>${campaign.budget.toLocaleString()} budget</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span className="text-muted-foreground">Impressions</span>
                  </div>
                  <div className="font-semibold">{campaign.impressions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span className="text-muted-foreground">Clicks</span>
                  </div>
                  <div className="font-semibold">{campaign.clicks.toLocaleString()}</div>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-muted-foreground">Conversions</span>
                  </div>
                  <div className="font-semibold">{campaign.conversions}</div>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="text-muted-foreground">ROI</span>
                  </div>
                  <div className="font-semibold text-green-600">{campaign.roi}%</div>
                </div>
              </div>

              <Button className="w-full" variant="outline" size="sm">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>AI Campaign Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Performance Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Your content partnership campaigns are showing 55% higher ROI compared to paid advertising. 
              Consider reallocating 20% of your Google Ads budget to content partnerships for better returns.
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Recommendations</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Increase content partnership budget by $3,000 for Q2</li>
              <li>• A/B test Google Ads landing pages to improve conversion rates</li>
              <li>• Plan follow-up campaigns for SaaS Summit 2024 attendees</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}