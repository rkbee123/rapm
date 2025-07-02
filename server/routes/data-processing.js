import express from 'express';

const router = express.Router();

// Process uploaded file data
router.post('/process', async (req, res) => {
  try {
    const { supabase } = req;
    const { fileData, campaignType, fileName } = req.body;
    
    if (!fileData || !campaignType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Process the data based on campaign type
    let processedData;
    switch (campaignType) {
      case 'linkedin':
        processedData = await processLinkedInData(supabase, fileData, fileName);
        break;
      case 'email':
        processedData = await processEmailData(supabase, fileData, fileName);
        break;
      case 'webinar':
        processedData = await processWebinarData(supabase, fileData, fileName);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported campaign type' });
    }
    
    res.json({
      success: true,
      message: 'Data processed successfully',
      processedRows: processedData.processedRows,
      datasetId: processedData.datasetId
    });
    
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Failed to process data' });
  }
});

// Get processed datasets
router.get('/datasets', async (req, res) => {
  try {
    const { supabase } = req;
    
    const { data: datasets, error } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(datasets || []);
    
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// Delete dataset
router.delete('/datasets/:id', async (req, res) => {
  try {
    const { supabase } = req;
    const { id } = req.params;
    
    // Delete dataset and related data
    const { error } = await supabase
      .from('datasets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Dataset deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({ error: 'Failed to delete dataset' });
  }
});

async function processLinkedInData(supabase, fileData, fileName) {
  // Create dataset record
  const { data: dataset, error: datasetError } = await supabase
    .from('datasets')
    .insert({
      name: fileName,
      type: 'linkedin',
      row_count: fileData.length,
      tags: ['LinkedIn', 'Imported'],
      file_path: `processed/${fileName}`,
      user_id: 'system'
    })
    .select()
    .single();
  
  if (datasetError) throw datasetError;
  
  // Process and insert LinkedIn contacts
  const linkedinContacts = fileData.map(row => ({
    name: row.name || row.Name || '',
    company: row.company || row.Company || '',
    title: row.title || row.Title || row.position || row.Position || '',
    date_sent: row.date_sent || row.dateSent || row['Date Sent'] || new Date().toISOString().split('T')[0],
    status: (row.status || row.Status || 'pending').toLowerCase(),
    campaign_id: row.campaign_id || row.campaignId || 'imported-campaign',
    dataset_id: dataset.id,
    linkedin_url: row.linkedin_url || row.linkedinUrl || row['LinkedIn URL'] || ''
  }));
  
  const { error: insertError } = await supabase
    .from('linkedin_contacts')
    .insert(linkedinContacts);
  
  if (insertError) throw insertError;
  
  return {
    processedRows: linkedinContacts.length,
    datasetId: dataset.id
  };
}

async function processEmailData(supabase, fileData, fileName) {
  // Create dataset record
  const { data: dataset, error: datasetError } = await supabase
    .from('datasets')
    .insert({
      name: fileName,
      type: 'email',
      row_count: fileData.length,
      tags: ['Email', 'Imported'],
      file_path: `processed/${fileName}`,
      user_id: 'system'
    })
    .select()
    .single();
  
  if (datasetError) throw datasetError;
  
  // Process and insert email contacts
  const emailContacts = fileData.map(row => ({
    name: row.name || row.Name || '',
    email: row.email || row.Email || '',
    company: row.company || row.Company || '',
    campaign_name: row.campaign_name || row.campaignName || row['Campaign Name'] || 'Imported Campaign',
    date_sent: row.date_sent || row.dateSent || row['Date Sent'] || new Date().toISOString().split('T')[0],
    opened: Boolean(row.opened || row.Opened || false),
    replied: Boolean(row.replied || row.Replied || false),
    dataset_id: dataset.id
  }));
  
  const { error: insertError } = await supabase
    .from('email_contacts')
    .insert(emailContacts);
  
  if (insertError) throw insertError;
  
  return {
    processedRows: emailContacts.length,
    datasetId: dataset.id
  };
}

async function processWebinarData(supabase, fileData, fileName) {
  // Create dataset record
  const { data: dataset, error: datasetError } = await supabase
    .from('datasets')
    .insert({
      name: fileName,
      type: 'webinar',
      row_count: fileData.length,
      tags: ['Webinar', 'Imported'],
      file_path: `processed/${fileName}`,
      user_id: 'system'
    })
    .select()
    .single();
  
  if (datasetError) throw datasetError;
  
  // Process and insert webinar attendees
  const webinarAttendees = fileData.map(row => ({
    name: row.name || row.Name || '',
    email: row.email || row.Email || '',
    company: row.company || row.Company || '',
    industry: row.industry || row.Industry || 'Other',
    invited_date: row.invited_date || row.invitedDate || row['Invited Date'] || new Date().toISOString().split('T')[0],
    rsvp_status: (row.rsvp_status || row.rsvpStatus || row['RSVP Status'] || 'pending').toLowerCase(),
    webinar_id: row.webinar_id || row.webinarId || 'imported-webinar',
    dataset_id: dataset.id
  }));
  
  const { error: insertError } = await supabase
    .from('webinar_attendees')
    .insert(webinarAttendees);
  
  if (insertError) throw insertError;
  
  return {
    processedRows: webinarAttendees.length,
    datasetId: dataset.id
  };
}

export { router as dataProcessingRouter };