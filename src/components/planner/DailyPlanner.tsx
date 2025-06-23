
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Download, FileText, Undo, Redo, Save } from 'lucide-react';
import { ScheduleItem } from '@/types/auth';

export const DailyPlanner: React.FC = () => {
  const { user, updateUserSchedule } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>(user?.schedule || []);
  const [undoStack, setUndoStack] = useState<ScheduleItem[][]>([]);
  const [redoStack, setRedoStack] = useState<ScheduleItem[][]>([]);

  useEffect(() => {
    if (user?.schedule) {
      setSchedule(user.schedule);
    }
  }, [user]);

  const parseTime = (timeStr: string): { hours: number; minutes: number; isPM: boolean } => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    return {
      hours: hours === 12 ? 0 : hours,
      minutes: minutes || 0,
      isPM: period === 'PM'
    };
  };

  const formatTime = (hours: number, minutes: number): string => {
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const calculateDuration = (start: string, end: string): number => {
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    
    let startMinutes = (startTime.isPM ? startTime.hours + 12 : startTime.hours) * 60 + startTime.minutes;
    let endMinutes = (endTime.isPM ? endTime.hours + 12 : endTime.hours) * 60 + endTime.minutes;
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Next day
    }
    
    return endMinutes - startMinutes;
  };

  const addMinutes = (timeStr: string, minutes: number): string => {
    const time = parseTime(timeStr);
    let totalMinutes = (time.isPM ? time.hours + 12 : time.hours) * 60 + time.minutes + minutes;
    
    totalMinutes = totalMinutes % (24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    return formatTime(hours, mins);
  };

  const pushToUndo = (currentSchedule: ScheduleItem[]) => {
    setUndoStack(prev => [...prev, currentSchedule]);
    setRedoStack([]);
  };

  const handleTimeChange = (index: number, field: 'start' | 'end', value: string) => {
    if (!value.match(/^\d{1,2}:\d{2} (AM|PM)$/)) return;

    pushToUndo(schedule);
    
    const newSchedule = [...schedule];
    const originalDurations = schedule.map((item, i) => 
      i < schedule.length - 1 ? calculateDuration(item.start, item.end) : 0
    );

    newSchedule[index] = { ...newSchedule[index], [field]: value };

    if (field === 'start' && index < newSchedule.length - 1) {
      const duration = originalDurations[index];
      newSchedule[index].end = addMinutes(value, duration);
      
      // Update subsequent rows
      for (let i = index + 1; i < newSchedule.length; i++) {
        newSchedule[i].start = newSchedule[i - 1].end;
        if (i < newSchedule.length - 1) {
          newSchedule[i].end = addMinutes(newSchedule[i].start, originalDurations[i]);
        }
      }
    } else if (field === 'end' && index < newSchedule.length - 1) {
      // Update subsequent rows
      for (let i = index + 1; i < newSchedule.length; i++) {
        newSchedule[i].start = newSchedule[i - 1].end;
        if (i < newSchedule.length - 1) {
          newSchedule[i].end = addMinutes(newSchedule[i].start, originalDurations[i]);
        }
      }
    }

    setSchedule(newSchedule);
  };

  const handleTaskChange = (index: number, value: string) => {
    pushToUndo(schedule);
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], task: value };
    setSchedule(newSchedule);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, schedule]);
      setUndoStack(prev => prev.slice(0, -1));
      setSchedule(previousState);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, schedule]);
      setRedoStack(prev => prev.slice(0, -1));
      setSchedule(nextState);
    }
  };

  const handleSave = () => {
    updateUserSchedule(schedule);
    toast({
      title: "Schedule saved!",
      description: "Your daily planner has been updated successfully.",
    });
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    
    const printElement = document.getElementById('print-area');
    if (!printElement) return;

    const canvas = await html2canvas(printElement);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save('Daily_Schedule.pdf');
    
    toast({
      title: "PDF exported!",
      description: "Your schedule has been downloaded as PDF.",
    });
  };

  const exportToExcel = () => {
    const csvContent = [
      ['TIMINGS', 'PLAN'],
      ...schedule.map(item => [`${item.start} - ${item.end}`, item.task])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Daily_Schedule.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Excel exported!",
      description: "Your schedule has been downloaded as CSV file.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">📅 DAILY SCHEDULE</CardTitle>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={handleUndo} disabled={undoStack.length === 0} variant="outline" size="sm">
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button onClick={handleRedo} disabled={redoStack.length === 0} variant="outline" size="sm">
              <Redo className="h-4 w-4 mr-2" />
              Redo
            </Button>
            <Button onClick={handleSave} variant="default" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="border border-gray-300 p-3 text-left font-bold">TIMINGS</th>
                  <th className="border border-gray-300 p-3 text-left font-bold">PLAN</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2">
                      <div className="flex gap-2 items-center">
                        <Input
                          value={item.start}
                          onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                          className="w-24 text-sm"
                          placeholder="6:00 AM"
                        />
                        <span>-</span>
                        <Input
                          value={item.end}
                          onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                          className="w-24 text-sm"
                          placeholder="9:00 AM"
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input
                        value={item.task}
                        onChange={(e) => handleTaskChange(index, e.target.value)}
                        className="w-full"
                        placeholder="Enter your activity"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Hidden print area for PDF export */}
      <div id="print-area" className="hidden">
        <div className="p-8 bg-white">
          <h1 className="text-3xl font-bold text-center mb-8">📅 DAILY SCHEDULE</h1>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="border border-gray-300 p-4 text-left font-bold">TIMINGS</th>
                <th className="border border-gray-300 p-4 text-left font-bold">PLAN</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 p-4">{item.start} - {item.end}</td>
                  <td className="border border-gray-300 p-4">{item.task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
