"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Note } from '@/entities/Note';
import { Subject } from '@/entities/Subject';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Loader2, Pin, PinOff } from 'lucide-react';
import { format } from 'date-fns';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';

export default function NoteDetailPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [note, setNote] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const noteId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;

  useEffect(() => {
    if (isLoggedIn && noteId) {
      fetchNote();
    } else if (!noteId) {
      router.push(createPageUrl('Notes'));
    }
  }, [isLoggedIn, noteId]);

  const fetchNote = async () => {
    setLoading(true);
    try {
      const noteData = await Note.get(noteId!);
      setNote(noteData);
      if (noteData.subjectId) {
        const subjectData = await Subject.get(noteData.subjectId);
        setSubject(subjectData);
      }
    } catch (error) {
      console.error("Error fetching note:", error);
      toast({
        title: "Error",
        description: "Failed to load the note.",
        variant: "destructive",
      });
      router.push(createPageUrl('Notes'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await Note.delete(noteId!);
      toast({
        title: "Success",
        description: "Note deleted successfully.",
      });
      router.push(createPageUrl('Notes'));
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete the note.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const togglePin = async () => {
    try {
      const updatedNote = await Note.update(noteId!, { isPinned: !note.isPinned });
      setNote(updatedNote);
      toast({
        title: "Success",
        description: `Note ${updatedNote.isPinned ? 'pinned' : 'unpinned'}.`,
      });
    } catch (error) {
      console.error("Error pinning note:", error);
      toast({
        title: "Error",
        description: "Failed to update pin status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Note not found</h2>
        <p className="text-muted-foreground mt-2">The note you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => router.push(createPageUrl('Notes'))} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notes
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push(createPageUrl('Notes'))} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Notes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              {subject && (
                <Badge style={{ backgroundColor: subject.color, color: '#fff' }} className="mb-2 border-none">
                  {subject.name}
                </Badge>
              )}
              <CardTitle className="text-4xl font-bold text-foreground">{note.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: {format(new Date(note.lastModified), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={togglePin}>
                {note.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </Button>
              <Link href={createPageUrl('NoteEditor', { id: note.id })}>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your note.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <MarkdownRenderer content={note.content} />
          </div>
          {note.tags && note.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}