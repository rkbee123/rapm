import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { AIInsight } from '@/types';

interface AIInsightCardProps {
  insight: AIInsight;
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>{insight.title}</span>
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            {insight.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{insight.summary}</p>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Recommendations</span>
          </div>
          <ul className="space-y-2 text-sm">
            {insight.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Sparkles className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Button size="sm" className="w-full">
          View Detailed Analysis
        </Button>
      </CardContent>
    </Card>
  );
}