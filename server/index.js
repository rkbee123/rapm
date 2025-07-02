import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import { linkedinWebhookRouter } from './routes/linkedin-webhook.js';
import { analyticsRouter } from './routes/analytics.js';
import { dataProcessingRouter } from './routes/data-processing.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add supabase to request object
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/api/webhook/linkedin', linkedinWebhookRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/data', dataProcessingRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Scheduled tasks
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily analytics update...');
  try {
    // Generate daily insights
    await generateDailyInsights();
  } catch (error) {
    console.error('Error in daily analytics update:', error);
  }
});

async function generateDailyInsights() {
  try {
    // Fetch recent campaign data
    const { data: linkedinData } = await supabase
      .from('linkedin_contacts')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: emailData } = await supabase
      .from('email_contacts')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Calculate metrics
    const linkedinAcceptanceRate = linkedinData?.length > 0 
      ? (linkedinData.filter(c => c.status === 'accepted').length / linkedinData.length) * 100 
      : 0;

    const emailOpenRate = emailData?.length > 0 
      ? (emailData.filter(c => c.opened).length / emailData.length) * 100 
      : 0;

    // Generate AI insight
    const insight = {
      type: 'daily',
      title: 'Daily Performance Summary',
      summary: `Today's performance: ${linkedinData?.length || 0} LinkedIn requests sent with ${linkedinAcceptanceRate.toFixed(1)}% acceptance rate. ${emailData?.length || 0} emails sent with ${emailOpenRate.toFixed(1)}% open rate.`,
      recommendations: generateRecommendations(linkedinAcceptanceRate, emailOpenRate),
      created_at: new Date().toISOString()
    };

    // Store insight in database
    await supabase.from('ai_insights').insert(insight);
    
    console.log('Daily insights generated successfully');
  } catch (error) {
    console.error('Error generating daily insights:', error);
  }
}

function generateRecommendations(linkedinRate, emailRate) {
  const recommendations = [];
  
  if (linkedinRate < 20) {
    recommendations.push('LinkedIn acceptance rate is below average. Consider personalizing connection messages more.');
  }
  
  if (emailRate < 25) {
    recommendations.push('Email open rate could be improved. Try A/B testing subject lines.');
  }
  
  if (linkedinRate > 30) {
    recommendations.push('Excellent LinkedIn performance! Scale up your outreach efforts.');
  }
  
  if (emailRate > 35) {
    recommendations.push('Great email engagement! Consider increasing send frequency.');
  }
  
  return recommendations.length > 0 ? recommendations : ['Continue current strategy - performance is stable.'];
}

app.listen(PORT, () => {
  console.log(`🚀 RAP Dashboard Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});