
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';
import { Users, Calendar, Download, FileText, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AdminDashboard: React.FC = () => {
  const { getAllUsers, user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const users = getAllUsers().filter(u => u.id !== user?.id);

  const exportUserSchedulePDF = async (targetUser: User) => {
    const { jsPDF } = await import('jspdf');
    
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('📅 DAILY SCHEDULE', 105, 30, { align: 'center' });
    
    // Add user info
    pdf.setFontSize(12);
    pdf.text(`User: ${targetUser.username} (${targetUser.email})`, 20, 50);
    pdf.text(`Last Modified: ${new Date(targetUser.lastEdited).toLocaleDateString()}`, 20, 60);
    
    // Add table headers
    pdf.setFontSize(14);
    pdf.text('TIMINGS', 20, 80);
    pdf.text('PLAN', 100, 80);
    
    // Add schedule data
    pdf.setFontSize(10);
    let yPosition = 95;
    
    targetUser.schedule.forEach((item, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.text(`${item.start} - ${item.end}`, 20, yPosition);
      pdf.text(item.task, 100, yPosition);
      yPosition += 15;
    });
    
    pdf.save(`${targetUser.username}_Schedule.pdf`);
    
    toast({
      title: "PDF exported!",
      description: `${targetUser.username}'s schedule has been downloaded.`,
    });
  };

  const exportUserScheduleExcel = (targetUser: User) => {
    const csvContent = [
      ['TIMINGS', 'PLAN', 'USER', 'LAST_MODIFIED'],
      ...targetUser.schedule.map(item => [
        `${item.start} - ${item.end}`,
        item.task,
        targetUser.username,
        new Date(targetUser.lastEdited).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetUser.username}_Schedule.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Excel exported!",
      description: `${targetUser.username}'s schedule has been downloaded as CSV.`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {users.reduce((acc, u) => acc + u.schedule.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {users.filter(u => {
                        const lastEdited = new Date(u.lastEdited);
                        const today = new Date();
                        return (today.getTime() - lastEdited.getTime()) < 24 * 60 * 60 * 1000;
                      }).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Management</h3>
            
            <div className="grid gap-4">
              {users.map((targetUser) => (
                <Card key={targetUser.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">{targetUser.username}</h4>
                        <p className="text-sm text-muted-foreground">{targetUser.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={targetUser.role === 'admin' ? 'default' : 'secondary'}>
                            {targetUser.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Last active: {new Date(targetUser.lastEdited).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(selectedUser?.id === targetUser.id ? null : targetUser)}
                      >
                        {selectedUser?.id === targetUser.id ? 'Hide' : 'View'} Schedule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportUserSchedulePDF(targetUser)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportUserScheduleExcel(targetUser)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                  
                  {selectedUser?.id === targetUser.id && (
                    <div className="mt-4 border-t pt-4">
                      <h5 className="font-medium mb-3">Daily Schedule</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 rounded text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left">Time</th>
                              <th className="border border-gray-300 p-2 text-left">Activity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {targetUser.schedule.map((item, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 p-2">
                                  {item.start} - {item.end}
                                </td>
                                <td className="border border-gray-300 p-2">{item.task}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
