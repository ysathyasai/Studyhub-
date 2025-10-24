"use client";

import React, { useState, useEffect } from 'react';
import { Formula } from '@/entities/Formula';
import { Subject } from '@/entities/Subject';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Calculator } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function FormulaReferencePage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [formulas, setFormulas] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    const [formulasData, subjectsData] = await Promise.all([Formula.list(), Subject.list()]);
    setFormulas(formulasData);
    setSubjects(subjectsData);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Calculator className="h-8 w-8 text-primary" /> Formula Reference</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formulas.map(formula => (
          <Card key={formula.id}>
            <CardHeader>
              <CardTitle>{formula.title}</CardTitle>
              <p className="text-lg font-mono text-primary">{formula.formula}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{formula.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}