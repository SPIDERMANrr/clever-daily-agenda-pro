
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Download, FileText, Undo, Redo, Save, Plus, Trash } from 'lucide-react';
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

  // Convert 12-hour format to 24-hour format for input[type="time"]
  const convertTo24Hour = (time12h: string): string => {
    const [time, period] = time12h.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  };

  // Convert 24-hour format to 12-hour format
  const convertTo12Hour = (time24h: string): string => {
    const [hours, minutes] = time24h.split(':');
    let hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    
    if (hour === 0) hour = 12;
    if (hour > 12) hour -= 12;
    
    return `${hour}:${minutes} ${period}`;
  };

  const calculateDuration = (start: string, end: string): number => {
    const startTime = convertTo24Hour(start);
    const endTime = convertTo24Hour(end);
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    let startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;
    
    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60; // Next day
    }
    
    return endTotalMinutes - startTotalMinutes;
  };

  const addMinutesToTime = (time: string, minutes: number): string => {
    const time24h = convertTo24Hour(time);
    const [hours, mins] = time24h.split(':').map(Number);
    
    let totalMinutes = hours * 60 + mins + minutes;
    totalMinutes = totalMinutes % (24 * 60);
    
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    
    const newTime24h = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    return convertTo12Hour(newTime24h);
  };

  const pushToUndo = (currentSchedule: ScheduleItem[]) => {
    setUndoStack(prev => [...prev, [...currentSchedule]]);
    setRedoStack([]);
  };

  const handleTimeChange = (index: number, field: 'start' | 'end', value: string) => {
    if (!value) return;

    pushToUndo(schedule);
    
    const newSchedule = [...schedule];
    const time12h = convertTo12Hour(value);
    
    // Store original durations before making changes
    const originalDurations = schedule.map((item, i) => 
      i < schedule.length - 1 ? calculateDuration(item.start, item.end) : 0
    );

    newSchedule[index] = { ...newSchedule[index], [field]: time12h };

    if (field === 'start') {
      // When start time changes, maintain the original duration
      if (index < newSchedule.length - 1) {
        const duration = originalDurations[index];
        newSchedule[index].end = addMinutesToTime(time12h, duration);
      }
      
      // Update all subsequent rows
      for (let i = index + 1; i < newSchedule.length; i++) {
        newSchedule[i].start = newSchedule[i - 1].end;
        if (i < newSchedule.length - 1) {
          const duration = originalDurations[i];
          newSchedule[i].end = addMinutesToTime(newSchedule[i].start, duration);
        }
      }
    } else if (field === 'end') {
      // When end time changes, update all subsequent rows
      for (let i = index + 1; i < newSchedule.length; i++) {
        newSchedule[i].start = newSchedule[i - 1].end;
        if (i < newSchedule.length - 1) {
          const duration = originalDurations[i];
          newSchedule[i].end = addMinutesToTime(newSchedule[i].start, duration);
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

  const handleAddRow = () => {
    pushToUndo(schedule);
    
    const newSchedule = [...schedule];
    const lastItem = newSchedule[newSchedule.length - 1];
    const newStartTime = lastItem ? lastItem.end : '6:00 AM';
    const newEndTime = addMinutesToTime(newStartTime, 60); // Default 1 hour duration
    
    const newItem: ScheduleItem = {
      start: newStartTime,
      end: newEndTime,
      task: ''
    };
    
    newSchedule.push(newItem);
    setSchedule(newSchedule);
    
    toast({
      title: "Row added",
      description: "New schedule item has been added.",
    });
  };

  const handleDeleteRow = (index: number) => {
    if (schedule.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "At least one schedule item must remain.",
        variant: "destructive"
      });
      return;
    }

    pushToUndo(schedule);
    
    const newSchedule = [...schedule];
    const deletedItem = newSchedule[index];
    
    // Store original durations before deletion
    const originalDurations = newSchedule.map((item, i) => 
      i < newSchedule.length - 1 ? calculateDuration(item.start, item.end) : 0
    );
    
    // Remove the item
    newSchedule.splice(index, 1);
    
    // Adjust following items if not deleting the last item
    if (index < newSchedule.length) {
      // Set the start time of the next item to the deleted item's start time
      newSchedule[index].start = deletedItem.start;
      
      // Recalculate end time using original duration
      if (index < newSchedule.length - 1) {
        const duration = originalDurations[index + 1]; // +1 because we removed an item
        newSchedule[index].end = addMinutesToTime(newSchedule[index].start, duration);
      }
      
      // Update all subsequent rows
      for (let i = index + 1; i < newSchedule.length; i++) {
        newSchedule[i].start = newSchedule[i - 1].end;
        if (i < newSchedule.length - 1) {
          const duration = originalDurations[i + 1]; // +1 because we removed an item
          newSchedule[i].end = addMinutesToTime(newSchedule[i].start, duration);
        }
      }
    }
    
    setSchedule(newSchedule);
    
    toast({
      title: "Row deleted",
      description: "Schedule item has been removed.",
    });
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, [...schedule]]);
      setUndoStack(prev => prev.slice(0, -1));
      setSchedule(previousState);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, [...schedule]]);
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
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      // Create and populate the print area
      const printArea = document.getElementById('print-area');
      if (!printArea) return;
      
      // Clear and populate the print area with current schedule
      printArea.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: bold;">
          📅 DAILY SCHEDULE
        </div>
        <table style="width: 100%; border-collapse: collapse; font-family: 'Poppins', sans-serif; font-size: 14px;">
          <thead>
            <tr style="background-color: #333; color: white;">
              <th style="border: 1px solid #999; padding: 12px; text-align: left; text-transform: uppercase; font-weight: bold;">TIMINGS</th>
              <th style="border: 1px solid #999; padding: 12px; text-align: left; text-transform: uppercase; font-weight: bold;">PLAN</th>
            </tr>
          </thead>
          <tbody>
            ${schedule.map((item, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f2f2f2'};">
                <td style="border: 1px solid #999; padding: 12px; font-weight: 500;">${item.start} - ${item.end}</td>
                <td style="border: 1px solid #999; padding: 12px;">${item.task}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      
      // Generate PDF from the print area
      const canvas = await html2canvas(printArea, { 
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF with proper positioning
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
      
      pdf.save('Daily_Schedule.pdf');
      
      toast({
        title: "PDF exported!",
        description: "Your schedule has been downloaded as PDF.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive"
      });
    }
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
    <>
      {/* Hidden print area for PDF export */}
      <div 
        id="print-area" 
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '800px',
          backgroundColor: '#ffffff',
          padding: '20px'
        }}
      />
      
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
              <Button onClick={handleAddRow} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Row
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
                    <th className="border border-gray-300 p-3 text-center font-bold w-16">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-2">
                        <div className="flex gap-2 items-center">
                          <input
                            type="time"
                            value={convertTo24Hour(item.start)}
                            onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                            className="time-field w-32 font-bold text-base px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            style={{
                              minWidth: '130px',
                              fontWeight: 'bold',
                              fontSize: '16px',
                              padding: '6px 8px',
                              border: '1px solid #ccc',
                              borderRadius: '6px'
                            }}
                          />
                          <span className="text-gray-500 font-bold">-</span>
                          <input
                            type="time"
                            value={convertTo24Hour(item.end)}
                            onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                            className="time-field w-32 font-bold text-base px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            style={{
                              minWidth: '130px',
                              fontWeight: 'bold',
                              fontSize: '16px',
                              padding: '6px 8px',
                              border: '1px solid #ccc',
                              borderRadius: '6px'
                            }}
                          />
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Input
                          value={item.task}
                          onChange={(e) => handleTaskChange(index, e.target.value)}
                          className="w-full border-0 focus:ring-0 focus:outline-none bg-transparent"
                          placeholder="Enter your activity"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <Button
                          onClick={() => handleDeleteRow(index)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          disabled={schedule.length <= 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
