import express from 'express';

const router = express.Router();

// Endpoint to receive data from n8n
router.post('/from-n8n', async (req, res) => {
  try {
    console.log('📨 Received data from n8n:', JSON.stringify(req.body, null, 2));
    
    const { supabase } = req;
    const { 
      dataType, 
      campaignType, 
      data, 
      source = 'n8n',
      metadata = {} 
    } = req.body;
    
    // Validate required fields
    if (!dataType || !data) {
      return res.status(400).json({ 
        error: 'Missing required fields: dataType and data are required' 
      });
    }
    
    let processedData;
    
    // Process data based on type
    switch (dataType) {
      case 'linkedin_contacts':
        processedData = await processLinkedInContacts(supabase, data, metadata);
        break;
      case 'email_contacts':
        processedData = await processEmailContacts(supabase, data, metadata);
        break;
      case 'webinar_attendees':
        processedData = await processWebinarAttendees(supabase, data, metadata);
        break;
      case 'campaign_metrics':
        processedData = await processCampaignMetrics(supabase, data, metadata);
        break;
      case 'raw_data':
        processedData = await processRawData(supabase, data, metadata);
        break;
      default:
        return res.status(400).json({ 
          error: `Unsupported dataType: ${dataType}. Supported types: linkedin_contacts, email_contacts, webinar_attendees, campaign_metrics, raw_data` 
        });
    }
    
    // Log the n8n integration event
    await supabase.from('webhook_logs').insert({
      source: 'n8n',
      event_type: dataType,
      data: req.body,
      processed_at: new Date().toISOString(),
      status: 'success'
    });
    
    res.status(200).json({
      success: true,
      message: 'Data processed successfully',
      dataType,
      processedRecords: processedData.count,
      insertedIds: processedData.ids || []
    });
    
  } catch (error) {
    console.error('❌ Error processing n8n data:', error);
    
    // Log the error
    try {
      await req.supabase.from('webhook_logs').insert({
        source: 'n8n',
        event_type: req.body?.dataType || 'unknown',
        data: req.body,
        processed_at: new Date().toISOString(),
        status: 'error',
        error_message: error.message
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    res.status(500).json({
      error: 'Failed to process data',
      message: error.message
    });
  }
});

// Process LinkedIn contacts data
async function processLinkedInContacts(supabase, data, metadata) {
  const contacts = Array.isArray(data) ? data : [data];
  
  const processedContacts = contacts.map(contact => ({
    name: contact.name || contact.fullName || 'Unknown',
    company: contact.company || contact.companyName || 'Unknown',
    title: contact.title || contact.jobTitle || contact.position || 'Unknown',
    linkedin_url: contact.linkedinUrl || contact.profileUrl || contact.url,
    date_sent: contact.dateSent || contact.sentDate || new Date().toISOString().split('T')[0],
    status: (contact.status || 'pending').toLowerCase(),
    campaign_id: contact.campaignId || metadata.campaignId || 'n8n-campaign',
    message_text: contact.messageText || contact.message,
    dataset_id: metadata.datasetId || 'n8n-import',
    created_at: new Date().toISOString()
  }));
  
  const { data: insertedData, error } = await supabase
    .from('linkedin_contacts')
    .insert(processedContacts)
    .select('id');
  
  if (error) throw error;
  
  return {
    count: processedContacts.length,
    ids: insertedData?.map(item => item.id) || []
  };
}

// Process email contacts data
async function processEmailContacts(supabase, data, metadata) {
  const contacts = Array.isArray(data) ? data : [data];
  
  const processedContacts = contacts.map(contact => ({
    name: contact.name || contact.fullName || 'Unknown',
    email: contact.email || contact.emailAddress,
    company: contact.company || contact.companyName || 'Unknown',
    campaign_name: contact.campaignName || metadata.campaignName || 'n8n Campaign',
    date_sent: contact.dateSent || contact.sentDate || new Date().toISOString().split('T')[0],
    opened: Boolean(contact.opened || contact.wasOpened || false),
    replied: Boolean(contact.replied || contact.hasReplied || false),
    dataset_id: metadata.datasetId || 'n8n-import',
    created_at: new Date().toISOString()
  }));
  
  const { data: insertedData, error } = await supabase
    .from('email_contacts')
    .insert(processedContacts)
    .select('id');
  
  if (error) throw error;
  
  return {
    count: processedContacts.length,
    ids: insertedData?.map(item => item.id) || []
  };
}

// Process webinar attendees data
async function processWebinarAttendees(supabase, data, metadata) {
  const attendees = Array.isArray(data) ? data : [data];
  
  const processedAttendees = attendees.map(attendee => ({
    name: attendee.name || attendee.fullName || 'Unknown',
    email: attendee.email || attendee.emailAddress,
    company: attendee.company || attendee.companyName || 'Unknown',
    industry: attendee.industry || 'Other',
    invited_date: attendee.invitedDate || attendee.inviteDate || new Date().toISOString().split('T')[0],
    rsvp_status: (attendee.rsvpStatus || attendee.status || 'pending').toLowerCase(),
    webinar_id: attendee.webinarId || metadata.webinarId || 'n8n-webinar',
    dataset_id: metadata.datasetId || 'n8n-import',
    created_at: new Date().toISOString()
  }));
  
  const { data: insertedData, error } = await supabase
    .from('webinar_attendees')
    .insert(processedAttendees)
    .select('id');
  
  if (error) throw error;
  
  return {
    count: processedAttendees.length,
    ids: insertedData?.map(item => item.id) || []
  };
}

// Process campaign metrics data
async function processCampaignMetrics(supabase, data, metadata) {
  const metrics = Array.isArray(data) ? data : [data];
  
  // Store metrics in a generic metrics table or update existing campaigns
  const processedMetrics = metrics.map(metric => ({
    campaign_id: metric.campaignId || metadata.campaignId,
    campaign_name: metric.campaignName || metadata.campaignName,
    metric_type: metric.metricType || 'general',
    metric_value: metric.value || metric.metricValue,
    metric_date: metric.date || metric.metricDate || new Date().toISOString().split('T')[0],
    source: 'n8n',
    raw_data: metric,
    created_at: new Date().toISOString()
  }));
  
  // Create metrics table entry (you may need to create this table)
  const { data: insertedData, error } = await supabase
    .from('campaign_metrics')
    .insert(processedMetrics)
    .select('id');
  
  if (error) {
    // If table doesn't exist, just log the metrics
    console.log('Campaign metrics received:', processedMetrics);
    return { count: processedMetrics.length, ids: [] };
  }
  
  return {
    count: processedMetrics.length,
    ids: insertedData?.map(item => item.id) || []
  };
}

// Process raw data (flexible format)
async function processRawData(supabase, data, metadata) {
  const records = Array.isArray(data) ? data : [data];
  
  // Store in a generic raw_data table for later processing
  const processedRecords = records.map(record => ({
    data_type: metadata.dataType || 'unknown',
    source: 'n8n',
    raw_data: record,
    metadata: metadata,
    created_at: new Date().toISOString()
  }));
  
  const { data: insertedData, error } = await supabase
    .from('raw_data_imports')
    .insert(processedRecords)
    .select('id');
  
  if (error) {
    // If table doesn't exist, just log the data
    console.log('Raw data received:', processedRecords);
    return { count: processedRecords.length, ids: [] };
  }
  
  return {
    count: processedRecords.length,
    ids: insertedData?.map(item => item.id) || []
  };
}

// Health check endpoint for n8n
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'n8n-integration',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/from-n8n': 'Receive data from n8n workflows'
    }
  });
});

// Get recent n8n imports
router.get('/recent-imports', async (req, res) => {
  try {
    const { supabase } = req;
    const { limit = 10 } = req.query;
    
    const { data: recentImports, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('source', 'n8n')
      .order('processed_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json({
      imports: recentImports || [],
      count: recentImports?.length || 0
    });
    
  } catch (error) {
    console.error('Error fetching recent imports:', error);
    res.status(500).json({ error: 'Failed to fetch recent imports' });
  }
});

export { router as n8nIntegrationRouter };