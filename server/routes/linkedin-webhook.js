import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Middleware to verify LinkedIn webhook signature
const verifyLinkedInSignature = (req, res, next) => {
  const signature = req.headers['x-linkedin-signature'];
  const secret = process.env.LINKEDIN_WEBHOOK_SECRET;
  
  if (!signature || !secret) {
    console.warn('Missing LinkedIn webhook signature or secret');
    return next(); // Continue without verification in development
  }
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
  } catch (error) {
    console.error('Error verifying LinkedIn signature:', error);
    res.status(400).json({ error: 'Signature verification failed' });
  }
};

// LinkedIn webhook endpoint
router.post('/', verifyLinkedInSignature, async (req, res) => {
  try {
    console.log('📨 LinkedIn webhook received:', JSON.stringify(req.body, null, 2));
    
    const { eventType, data, timestamp } = req.body;
    
    // Process different types of LinkedIn events
    switch (eventType) {
      case 'connection_request_sent':
        await handleConnectionRequestSent(req.supabase, data);
        break;
      case 'connection_request_accepted':
        await handleConnectionRequestAccepted(req.supabase, data);
        break;
      case 'connection_request_declined':
        await handleConnectionRequestDeclined(req.supabase, data);
        break;
      case 'message_sent':
        await handleMessageSent(req.supabase, data);
        break;
      case 'profile_view':
        await handleProfileView(req.supabase, data);
        break;
      default:
        console.log(`Unknown event type: ${eventType}`);
    }
    
    // Log the webhook event
    await req.supabase.from('webhook_logs').insert({
      source: 'linkedin',
      event_type: eventType,
      data: data,
      processed_at: new Date().toISOString(),
      status: 'success'
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      eventType 
    });
    
  } catch (error) {
    console.error('❌ Error processing LinkedIn webhook:', error);
    
    // Log the error
    await req.supabase.from('webhook_logs').insert({
      source: 'linkedin',
      event_type: req.body?.eventType || 'unknown',
      data: req.body,
      processed_at: new Date().toISOString(),
      status: 'error',
      error_message: error.message
    });
    
    res.status(500).json({ 
      error: 'Failed to process webhook',
      message: error.message 
    });
  }
});

async function handleConnectionRequestSent(supabase, data) {
  const { recipientProfile, campaignId, messageText } = data;
  
  try {
    // Insert or update LinkedIn contact
    const contactData = {
      name: recipientProfile.name || 'Unknown',
      company: recipientProfile.company || 'Unknown',
      title: recipientProfile.title || 'Unknown',
      linkedin_url: recipientProfile.profileUrl,
      date_sent: new Date().toISOString().split('T')[0],
      status: 'pending',
      campaign_id: campaignId || 'webhook-campaign',
      message_text: messageText,
      dataset_id: 'webhook-data'
    };
    
    const { error } = await supabase
      .from('linkedin_contacts')
      .upsert(contactData, { 
        onConflict: 'linkedin_url',
        ignoreDuplicates: false 
      });
    
    if (error) throw error;
    
    console.log('✅ Connection request sent recorded:', recipientProfile.name);
  } catch (error) {
    console.error('Error recording connection request:', error);
    throw error;
  }
}

async function handleConnectionRequestAccepted(supabase, data) {
  const { senderProfile, acceptedAt } = data;
  
  try {
    const { error } = await supabase
      .from('linkedin_contacts')
      .update({ 
        status: 'accepted',
        accepted_at: acceptedAt || new Date().toISOString()
      })
      .eq('linkedin_url', senderProfile.profileUrl);
    
    if (error) throw error;
    
    console.log('✅ Connection request accepted:', senderProfile.name);
    
    // Trigger follow-up actions
    await triggerFollowUpActions(supabase, senderProfile);
    
  } catch (error) {
    console.error('Error updating accepted connection:', error);
    throw error;
  }
}

async function handleConnectionRequestDeclined(supabase, data) {
  const { senderProfile, declinedAt } = data;
  
  try {
    const { error } = await supabase
      .from('linkedin_contacts')
      .update({ 
        status: 'declined',
        declined_at: declinedAt || new Date().toISOString()
      })
      .eq('linkedin_url', senderProfile.profileUrl);
    
    if (error) throw error;
    
    console.log('❌ Connection request declined:', senderProfile.name);
  } catch (error) {
    console.error('Error updating declined connection:', error);
    throw error;
  }
}

async function handleMessageSent(supabase, data) {
  const { recipientProfile, messageText, conversationId } = data;
  
  try {
    // Log the message
    const { error } = await supabase
      .from('linkedin_messages')
      .insert({
        recipient_name: recipientProfile.name,
        recipient_url: recipientProfile.profileUrl,
        message_text: messageText,
        conversation_id: conversationId,
        sent_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    console.log('💬 Message sent recorded:', recipientProfile.name);
  } catch (error) {
    console.error('Error recording message:', error);
    throw error;
  }
}

async function handleProfileView(supabase, data) {
  const { viewedProfile, viewedAt } = data;
  
  try {
    // Log the profile view
    const { error } = await supabase
      .from('linkedin_profile_views')
      .insert({
        viewed_profile_name: viewedProfile.name,
        viewed_profile_url: viewedProfile.profileUrl,
        viewed_at: viewedAt || new Date().toISOString()
      });
    
    if (error) throw error;
    
    console.log('👁️ Profile view recorded:', viewedProfile.name);
  } catch (error) {
    console.error('Error recording profile view:', error);
    throw error;
  }
}

async function triggerFollowUpActions(supabase, profile) {
  try {
    // Create a follow-up task
    await supabase.from('follow_up_tasks').insert({
      contact_name: profile.name,
      contact_url: profile.profileUrl,
      task_type: 'send_thank_you_message',
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours later
      status: 'pending'
    });
    
    console.log('📅 Follow-up task created for:', profile.name);
  } catch (error) {
    console.error('Error creating follow-up task:', error);
  }
}

// Test endpoint for webhook
router.get('/test', (req, res) => {
  res.json({ 
    message: 'LinkedIn webhook endpoint is working',
    timestamp: new Date().toISOString(),
    webhookUrl: 'https://becoming-ferret-informally.ngrok-free.app/webhook-test/linkedin'
  });
});

export { router as linkedinWebhookRouter };