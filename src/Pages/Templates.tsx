"use client";

import React, { useState, useEffect } from 'react';
import { Template } from '@/entities/Template';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TemplatesPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      loadTemplates();
    }
  }, [isLoggedIn]);

  const loadTemplates = async () => {
    const data = await Template.list();
    setTemplates(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><File className="h-8 w-8 text-primary" /> Template Library</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> New Template</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map(template => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}