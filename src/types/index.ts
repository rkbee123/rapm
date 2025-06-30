export interface Campaign {
  id: string;
  name: string;
  type: 'linkedin' | 'email' | 'webinar' | 'other';
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  totalSent?: number;
  acceptanceRate?: number;
  openRate?: number;
  replyRate?: number;
  rsvpRate?: number;
  roi?: number;
}

export interface LinkedInContact {
  id: string;
  name: string;
  company: string;
  title: string;
  dateSent: string;
  status: 'accepted' | 'pending' | 'declined';
  campaignId: string;
}

export interface EmailContact {
  id: string;
  name: string;
  email: string;
  company: string;
  campaignName: string;
  dateSent: string;
  opened: boolean;
  replied: boolean;
}

export interface WebinarAttendee {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  invitedDate: string;
  rsvpStatus: 'confirmed' | 'pending' | 'declined';
  webinarId: string;
}

export interface Webinar {
  id: string;
  topic: string;
  date: string;
  organizer: string;
  attendees: WebinarAttendee[];
}

export interface AIInsight {
  id: string;
  type: 'daily' | 'weekly' | 'campaign';
  title: string;
  summary: string;
  recommendations: string[];
  createdAt: string;
}

export interface UploadedDataset {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  rowCount: number;
  tags: string[];
}