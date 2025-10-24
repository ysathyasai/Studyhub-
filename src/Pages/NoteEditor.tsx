"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Note } from '@/entities/Note';
import { Subject } from '@/entities/Subject';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function NoteEditorPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  
  const [note, setNote] = useState({
    title: '',
    content: '',
    subjectId: '',
    tags: [] as string[],
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const noteId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;
  const isEditing = !!noteId;

  useEffect(() => {
    if (isLoggedIn) {
      fetchInitialData();
    }
  }, [isLoggedIn, noteId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const subjectsData = await Subject.list();
      setSubjects(subjectsData);

      if (isEditing) {
        const noteData = await Note.get(noteId!);
        setNote({
          title: noteData.title,
          content: noteData.content,
          subjectId: noteData.subjectId || '',
          tags: noteData.tags || [],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data for the editor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (value: string) => {
    setNote(prev => ({ ...prev, subjectId: value }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !note.tags.includes(newTag)) {
        setNote(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNote(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSave = async () => {
    if (!note.title) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your note.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const notePayload = {
        ...note,
        lastModified: new Date().toISOString(),
      };

      if (isEditing) {
        const updatedNote = await Note.update(noteId!, notePayload);
        toast({ title: "Success", description: "Note updated successfully." });
        router.push(createPageUrl('NoteDetail', { id: updatedNote.id }));
      } else {
        const newNote = await Note.create(notePayload);
        toast({ title: "Success", description: "Note created successfully." });
        router.push(createPageUrl('NoteDetail', { id: newNote.id }));
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save the note.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-slate-900">
            {isEditing ? 'Edit Note' : 'Create New Note'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Chapter 5: Quantum Mechanics"
              value={note.title}
              onChange={handleInputChange}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Start writing your notes here..."
              value={note.content}
              onChange={handleInputChange}
              rows={15}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject</Label>
              <Select value={note.subjectId} onValueChange={handleSubjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (press Enter to add)</Label>
              <Input
                id="tags"
                placeholder="e.g., important, exam, chapter-5"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {note.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 bg-slate-200 rounded-full px-3 py-1 text-sm">
                    <span>{tag}</span>
                    <button onClick={() => removeTag(tag)} className="text-slate-500 hover:text-slate-800">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}