"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../components/ui/use-toast';
import { ScheduleEvent } from '@/entities/ScheduleEvent';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface AddEventDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  subjects: any[];
  event: any | null;
  onEventAdded: (newEvent: any) => void;
}

export default function AddEventDialog({ isOpen, setIsOpen, subjects, event, onEventAdded }: AddEventDialogProps) {
  const [eventData, setEventData] = useState({
    title: '', description: '', subjectId: '', type: 'study',
    date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '10:00'
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (event) {
      setEventData({
        title: event.title,
        description: event.description || '',
        subjectId: event.subjectId || '',
        type: event.type,
        date: format(new Date(event.date), 'yyyy-MM-dd'),
        startTime: format(new Date(event.startTime), 'HH:mm'),
        endTime: format(new Date(event.endTime), 'HH:mm'),
      });
    } else {
      setEventData({
        title: '', description: '', subjectId: '', type: 'study',
        date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '10:00'
      });
    }
  }, [event, isOpen]);

  const handleSave = async () => {
    if (!eventData.title || !eventData.date || !eventData.startTime || !eventData.endTime) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...eventData,
        startTime: new Date(`${eventData.date}T${eventData.startTime}`).toISOString(),
        endTime: new Date(`${eventData.date}T${eventData.endTime}`).toISOString(),
        subjectId: eventData.subjectId || undefined,
      };
      
      let savedEvent;
      if (event) {
        savedEvent = await ScheduleEvent.update(event.id, payload);
      } else {
        savedEvent = await ScheduleEvent.create(payload);
      }
      
      onEventAdded(savedEvent);
      toast({ title: "Success", description: `Event ${event ? 'updated' : 'created'}.` });
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({ title: "Error", description: "Failed to save event.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={eventData.title} onChange={e => setEventData(p => ({...p, title: e.target.value}))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={eventData.type} onValueChange={v => setEventData(p => ({...p, type: v}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="break">Break</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={eventData.date} onChange={e => setEventData(p => ({...p, date: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="time" value={eventData.startTime} onChange={e => setEventData(p => ({...p, startTime: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" type="time" value={eventData.endTime} onChange={e => setEventData(p => ({...p, endTime: e.target.value}))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={eventData.subjectId} onValueChange={v => setEventData(p => ({...p, subjectId: v}))}>
              <SelectTrigger><SelectValue placeholder="Select a subject (optional)" /></SelectTrigger>
              <SelectContent>
                {subjects.map(subject => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={eventData.description} onChange={e => setEventData(p => ({...p, description: e.target.value}))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}