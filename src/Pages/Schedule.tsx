"use client";

import React, { useState, useEffect } from 'react';
import { ScheduleEvent } from '@/entities/ScheduleEvent';
import { Subject } from '@/entities/Subject';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import AddEventDialog from '../components/schedules/AddEventDialog';

export default function SchedulePage() {
  const { isLoggedIn } = useAppLevelAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const week = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6),
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsData, subjectsData] = await Promise.all([
        ScheduleEvent.list('startTime:asc'),
        Subject.list(),
      ]);
      setEvents(eventsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching schedule data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventAddedOrUpdated = (event: any) => {
    fetchData();
  };

  const openAddDialog = (event = null) => {
    setSelectedEvent(event);
    setAddDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Schedule</h1>
          <p className="text-muted-foreground mt-1">Plan your week for maximum productivity.</p>
        </div>
        <Button className="gap-2 w-full md:w-auto" onClick={() => openAddDialog()}>
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-border border border-border rounded-lg overflow-hidden">
              {week.map(day => (
                <div key={day.toString()} className="bg-card p-2">
                  <div className={`text-center mb-2 ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                    <p className="text-sm">{format(day, 'EEE')}</p>
                    <p className="text-2xl">{format(day, 'd')}</p>
                  </div>
                  <div className="space-y-2">
                    {events
                      .filter(event => isSameDay(new Date(event.date), day))
                      .map(event => {
                        const subject = subjects.find(s => s.id === event.subjectId);
                        return (
                          <div
                            key={event.id}
                            className="p-2 rounded-lg text-xs cursor-pointer"
                            style={{ backgroundColor: subject ? `${subject.color}20` : 'rgba(100, 116, 139, 0.1)', borderLeft: `4px solid ${subject?.color || '#4A5568'}` }}
                            onClick={() => openAddDialog(event)}
                          >
                            <p className="font-semibold">{event.title}</p>
                            <p>{format(new Date(event.startTime), 'h:mm a')}</p>
                            <p className="capitalize">{event.type}</p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddEventDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setAddDialogOpen}
        subjects={subjects}
        event={selectedEvent}
        onEventAdded={handleEventAddedOrUpdated}
      />
    </div>
  );
}