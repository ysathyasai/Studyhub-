"use client";

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
  note: any;
  subject?: any;
  onNoteDeleted: (noteId: string) => void;
}

export default function NoteCard({ note, subject }: NoteCardProps) {
  const contentSnippet = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');

  return (
    <Link href={createPageUrl('NoteDetail', { id: note.id })}>
      <Card className="h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 bg-card border-border">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {subject && (
                <Badge style={{ backgroundColor: subject.color, color: '#fff' }} className="mb-2 border-none text-xs">
                  {subject.name}
                </Badge>
              )}
              <CardTitle className="text-lg font-bold text-foreground leading-tight">{note.title}</CardTitle>
            </div>
            {note.isPinned && <Pin className="h-4 w-4 text-primary" />}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground mb-4">{contentSnippet}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags?.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </CardContent>
        <div className="p-6 pt-0 text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(note.lastModified), { addSuffix: true })}
        </div>
      </Card>
    </Link>
  );
}