import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PieChart } from '@/components/charts/PieChart';
import { Video, Calendar, Users, Brain, Download, Plus } from 'lucide-react';
import { mockWebinars, mockWebinarAttendees, industryData } from '@/lib/mockData';
import { motion } from 'framer-motion';

export function Webinars() {
  const stats = {
    totalInvited: 1250,
    confirmed: 230,
    pending: 892,
    declined: 128,
    rsvpRate: 18.4,
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webinars</h1>
          <p className="text-muted-foreground">
            Manage your webinars and track attendee engagement
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            AI Attendance Prediction
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Webinar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvited}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Declined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">RSVP Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rsvpRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Webinars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5" />
                <span>Upcoming Webinars</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mockWebinars.map((webinar) => (
                <div key={webinar.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{webinar.topic}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{webinar.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{webinar.organizer}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Attendees Table */}
          <Card>
            <CardHeader>
              <CardTitle>Webinar Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Invited Date</TableHead>
                    <TableHead>RSVP Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWebinarAttendees.map((attendee) => (
                    <TableRow key={attendee.id}>
                      <TableCell className="font-medium">{attendee.name}</TableCell>
                      <TableCell>{attendee.company}</TableCell>
                      <TableCell>{attendee.industry}</TableCell>
                      <TableCell>{attendee.invitedDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            attendee.rsvpStatus === 'confirmed'
                              ? 'default'
                              : attendee.rsvpStatus === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {attendee.rsvpStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Industry Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Attendee Industries</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={industryData} height={250} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Attendee List
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Video className="h-4 w-4 mr-2" />
                Send Reminders
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}