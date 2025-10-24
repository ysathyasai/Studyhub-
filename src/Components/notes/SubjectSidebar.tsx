"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Folder } from 'lucide-react';

interface SubjectSidebarProps {
  subjects: any[];
  selectedSubject: string | null;
  onSelectSubject: (subjectId: string | null) => void;
}

export default function SubjectSidebar({ subjects, selectedSubject, onSelectSubject }: SubjectSidebarProps) {
  return (
    <div className="hidden md:block w-64 bg-background border-r border-border p-4">
      <h2 className="text-lg font-semibold mb-4 px-2">Subjects</h2>
      <div className="space-y-1">
        <Button
          variant={!selectedSubject ? 'secondary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onSelectSubject(null)}
        >
          All Notes
        </Button>
        {subjects.map(subject => (
          <Button
            key={subject.id}
            variant={selectedSubject === subject.id ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onSelectSubject(subject.id)}
          >
            <span
              className="h-3 w-3 rounded-full mr-2"
              style={{ backgroundColor: subject.color }}
            />
            {subject.name}
          </Button>
        ))}
      </div>
    </div>
  );
}