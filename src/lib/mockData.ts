import { 
  Campaign, 
  LinkedInContact, 
  EmailContact, 
  Webinar, 
  WebinarAttendee, 
  AIInsight,
  UploadedDataset 
} from '@/types';

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q4 SaaS Outreach',
    type: 'linkedin',
    status: 'active',
    createdAt: '2024-01-15',
    metrics: {
      totalSent: 847,
      acceptanceRate: 23.5,
    },
  },
  {
    id: '2',
    name: 'Product Launch Email',
    type: 'email',
    status: 'completed',
    createdAt: '2024-01-10',
    metrics: {
      totalSent: 2341,
      openRate: 34.2,
      replyRate: 8.7,
    },
  },
  {
    id: '3',
    name: 'AI Transformation Webinar',
    type: 'webinar',
    status: 'active',
    createdAt: '2024-01-20',
    metrics: {
      totalSent: 1250,
      rsvpRate: 18.4,
    },
  },
];

export const mockLinkedInContacts: LinkedInContact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'TechFlow Solutions',
    title: 'VP of Marketing',
    dateSent: '2024-01-22',
    status: 'accepted',
    campaignId: '1',
  },
  {
    id: '2',
    name: 'Michael Chen',
    company: 'DataSync Inc',
    title: 'Chief Technology Officer',
    dateSent: '2024-01-21',
    status: 'pending',
    campaignId: '1',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    company: 'Growth Dynamics',
    title: 'Head of Sales',
    dateSent: '2024-01-20',
    status: 'accepted',
    campaignId: '1',
  },
];

export const mockEmailContacts: EmailContact[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex@innovatecorp.com',
    company: 'InnovateCorp',
    campaignName: 'Product Launch Email',
    dateSent: '2024-01-18',
    opened: true,
    replied: true,
  },
  {
    id: '2',
    name: 'Jessica Lee',
    email: 'jessica@futuretech.io',
    company: 'FutureTech',
    campaignName: 'Product Launch Email',
    dateSent: '2024-01-18',
    opened: true,
    replied: false,
  },
];

export const mockWebinarAttendees: WebinarAttendee[] = [
  {
    id: '1',
    name: 'David Kim',
    email: 'david@scalehub.com',
    company: 'ScaleHub',
    industry: 'SaaS',
    invitedDate: '2024-01-15',
    rsvpStatus: 'confirmed',
    webinarId: '1',
  },
  {
    id: '2',
    name: 'Lisa Wang',
    email: 'lisa@financeplus.co',
    company: 'FinancePlus',
    industry: 'FinTech',
    invitedDate: '2024-01-16',
    rsvpStatus: 'pending',
    webinarId: '1',
  },
];

export const mockWebinars: Webinar[] = [
  {
    id: '1',
    topic: 'AI Transformation in Modern Business',
    date: '2024-02-15',
    organizer: 'John Smith',
    attendees: mockWebinarAttendees,
  },
];

export const mockAIInsights: AIInsight[] = [
  {
    id: '1',
    type: 'weekly',
    title: 'Weekly Performance Summary',
    summary: 'LinkedIn acceptance rate increased by 5% this week, with highest engagement from SaaS industry professionals.',
    recommendations: [
      'Focus more outreach on SaaS companies for better conversion',
      'Optimize email subject lines based on highest performing segments',
      'Schedule follow-up webinars for engaged prospects',
    ],
    createdAt: '2024-01-22',
  },
  {
    id: '2',
    type: 'daily',
    title: 'Daily Campaign Update',
    summary: 'Strong performance across all channels today with 23 new LinkedIn connections and 156 email opens.',
    recommendations: [
      'Continue current LinkedIn messaging strategy',
      'A/B test email send times for better open rates',
    ],
    createdAt: '2024-01-23',
  },
];

export const mockUploadedDatasets: UploadedDataset[] = [
  {
    id: '1',
    name: 'Q4_LinkedIn_Prospects.csv',
    type: 'LinkedIn Campaign',
    uploadDate: '2024-01-20',
    rowCount: 847,
    tags: ['SaaS', 'Enterprise', 'Q4'],
  },
  {
    id: '2',
    name: 'Email_List_January.xlsx',
    type: 'Email Campaign',
    uploadDate: '2024-01-18',
    rowCount: 2341,
    tags: ['Product Launch', 'All Segments'],
  },
];

// Chart data
export const linkedInTrendData = [
  { week: 'Week 1', acceptanceRate: 18.2, sent: 142 },
  { week: 'Week 2', acceptanceRate: 21.5, sent: 189 },
  { week: 'Week 3', acceptanceRate: 23.8, sent: 256 },
  { week: 'Week 4', acceptanceRate: 26.1, sent: 260 },
];

export const emailTrendData = [
  { week: 'Week 1', openRate: 28.5, replyRate: 6.2 },
  { week: 'Week 2', openRate: 31.2, replyRate: 7.8 },
  { week: 'Week 3', openRate: 34.1, replyRate: 8.5 },
  { week: 'Week 4', openRate: 36.8, replyRate: 9.2 },
];

export const industryData = [
  { name: 'SaaS', value: 35, color: '#8B5CF6' },
  { name: 'FinTech', value: 25, color: '#06B6D4' },
  { name: 'Healthcare', value: 20, color: '#10B981' },
  { name: 'E-commerce', value: 15, color: '#F59E0B' },
  { name: 'Other', value: 5, color: '#EF4444' },
];