import express from 'express';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const { supabase } = req;
    
    // Get LinkedIn stats
    const { data: linkedinContacts } = await supabase
      .from('linkedin_contacts')
      .select('status, created_at');
    
    // Get email stats
    const { data: emailContacts } = await supabase
      .from('email_contacts')
      .select('opened, replied, created_at');
    
    // Get webinar stats
    const { data: webinarAttendees } = await supabase
      .from('webinar_attendees')
      .select('rsvp_status, created_at');
    
    // Calculate metrics
    const linkedinStats = calculateLinkedInStats(linkedinContacts || []);
    const emailStats = calculateEmailStats(emailContacts || []);
    const webinarStats = calculateWebinarStats(webinarAttendees || []);
    
    // Get recent AI insights
    const { data: insights } = await supabase
      .from('ai_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    res.json({
      linkedin: linkedinStats,
      email: emailStats,
      webinar: webinarStats,
      insights: insights || [],
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get LinkedIn campaign trends
router.get('/linkedin/trends', async (req, res) => {
  try {
    const { supabase } = req;
    const { timeframe = '30d' } = req.query;
    
    const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    
    const { data: contacts } = await supabase
      .from('linkedin_contacts')
      .select('status, date_sent, created_at')
      .gte('created_at', startDate.toISOString());
    
    const trends = calculateTrends(contacts || [], daysBack);
    
    res.json(trends);
    
  } catch (error) {
    console.error('Error fetching LinkedIn trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get email campaign performance
router.get('/email/performance', async (req, res) => {
  try {
    const { supabase } = req;
    
    const { data: contacts } = await supabase
      .from('email_contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    const performance = calculateEmailPerformance(contacts || []);
    
    res.json(performance);
    
  } catch (error) {
    console.error('Error fetching email performance:', error);
    res.status(500).json({ error: 'Failed to fetch email performance' });
  }
});

// Generate AI insights
router.post('/insights/generate', async (req, res) => {
  try {
    const { supabase } = req;
    const { type = 'weekly' } = req.body;
    
    // Fetch recent data
    const { data: linkedinData } = await supabase
      .from('linkedin_contacts')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    const { data: emailData } = await supabase
      .from('email_contacts')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    // Generate insights
    const insight = await generateAIInsight(linkedinData || [], emailData || [], type);
    
    // Save to database
    const { data: savedInsight, error } = await supabase
      .from('ai_insights')
      .insert(insight)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(savedInsight);
    
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

function calculateLinkedInStats(contacts) {
  const total = contacts.length;
  const accepted = contacts.filter(c => c.status === 'accepted').length;
  const pending = contacts.filter(c => c.status === 'pending').length;
  const declined = contacts.filter(c => c.status === 'declined').length;
  
  return {
    totalSent: total,
    accepted,
    pending,
    declined,
    acceptanceRate: total > 0 ? (accepted / total) * 100 : 0
  };
}

function calculateEmailStats(contacts) {
  const total = contacts.length;
  const opened = contacts.filter(c => c.opened).length;
  const replied = contacts.filter(c => c.replied).length;
  
  return {
    totalSent: total,
    opened,
    replied,
    openRate: total > 0 ? (opened / total) * 100 : 0,
    replyRate: total > 0 ? (replied / total) * 100 : 0
  };
}

function calculateWebinarStats(attendees) {
  const total = attendees.length;
  const confirmed = attendees.filter(a => a.rsvp_status === 'confirmed').length;
  const pending = attendees.filter(a => a.rsvp_status === 'pending').length;
  const declined = attendees.filter(a => a.rsvp_status === 'declined').length;
  
  return {
    totalInvited: total,
    confirmed,
    pending,
    declined,
    rsvpRate: total > 0 ? (confirmed / total) * 100 : 0
  };
}

function calculateTrends(contacts, days) {
  const trends = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayContacts = contacts.filter(c => 
      c.date_sent === dateStr || c.created_at.startsWith(dateStr)
    );
    
    const sent = dayContacts.length;
    const accepted = dayContacts.filter(c => c.status === 'accepted').length;
    const acceptanceRate = sent > 0 ? (accepted / sent) * 100 : 0;
    
    trends.push({
      date: dateStr,
      sent,
      accepted,
      acceptanceRate
    });
  }
  
  return trends;
}

function calculateEmailPerformance(contacts) {
  const campaigns = {};
  
  contacts.forEach(contact => {
    const campaign = contact.campaign_name || 'Default Campaign';
    
    if (!campaigns[campaign]) {
      campaigns[campaign] = {
        name: campaign,
        sent: 0,
        opened: 0,
        replied: 0
      };
    }
    
    campaigns[campaign].sent++;
    if (contact.opened) campaigns[campaign].opened++;
    if (contact.replied) campaigns[campaign].replied++;
  });
  
  return Object.values(campaigns).map(campaign => ({
    ...campaign,
    openRate: campaign.sent > 0 ? (campaign.opened / campaign.sent) * 100 : 0,
    replyRate: campaign.sent > 0 ? (campaign.replied / campaign.sent) * 100 : 0
  }));
}

async function generateAIInsight(linkedinData, emailData, type) {
  const linkedinStats = calculateLinkedInStats(linkedinData);
  const emailStats = calculateEmailStats(emailData);
  
  const recommendations = [];
  
  // Generate recommendations based on performance
  if (linkedinStats.acceptanceRate < 20) {
    recommendations.push('LinkedIn acceptance rate is below industry average. Consider personalizing your connection messages more.');
  } else if (linkedinStats.acceptanceRate > 30) {
    recommendations.push('Excellent LinkedIn performance! Consider scaling up your outreach efforts.');
  }
  
  if (emailStats.openRate < 25) {
    recommendations.push('Email open rates could be improved. Try A/B testing different subject lines.');
  } else if (emailStats.openRate > 35) {
    recommendations.push('Great email engagement! Consider increasing your send frequency.');
  }
  
  if (emailStats.replyRate > 10) {
    recommendations.push('High email reply rate indicates strong message relevance. Use similar messaging for future campaigns.');
  }
  
  const summary = `${type.charAt(0).toUpperCase() + type.slice(1)} performance summary: ${linkedinStats.totalSent} LinkedIn requests sent with ${linkedinStats.acceptanceRate.toFixed(1)}% acceptance rate. ${emailStats.totalSent} emails sent with ${emailStats.openRate.toFixed(1)}% open rate and ${emailStats.replyRate.toFixed(1)}% reply rate.`;
  
  return {
    type,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Performance Analysis`,
    summary,
    recommendations: recommendations.length > 0 ? recommendations : ['Continue current strategy - performance is stable.'],
    created_at: new Date().toISOString()
  };
}

export { router as analyticsRouter };