"use client";

import React, { useState, useEffect } from 'react';
import { CodeSnippet } from '@/entities/CodeSnippet';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Code, Save, Play, Download, Trash2, Copy } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', example: 'console.log("Hello, World!");' },
  { value: 'python', label: 'Python', example: 'print("Hello, World!")' },
  { value: 'java', label: 'Java', example: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}` },
  { value: 'cpp', label: 'C++', example: `#include <iostream>

int main() {
    std::cout << "Hello, World!";
    return 0;
}` },
];

export default function CodeCompilerPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveForm, setSaveForm] = useState({ title: '', description: '', category: 'utility', difficulty: 'beginner', tags: '' });

  useEffect(() => {
    if (isLoggedIn) {
      loadSnippets();
      const selectedLang = LANGUAGES.find(l => l.value === language);
      if (selectedLang && !code) setCode(selectedLang.example);
    }
  }, [isLoggedIn, language]);

  const loadSnippets = async () => {
    try {
      setSnippets(await CodeSnippet.list('createdAt:desc'));
    } catch (error) {
      console.error('Error loading snippets:', error);
    }
  };

  const simulateExecution = (code: string, language: string) => {
    const outputs: { [key: string]: string } = {
      javascript: `> node script.js
${code.includes('console.log') ? 'Hello, World!' : 'Script executed.'}
[Finished]`,
      python: `> python script.py
${code.includes('print') ? 'Hello, World!' : 'Script executed.'}
[Finished]`,
      java: `> javac Main.java && java Main
${code.includes('System.out.println') ? 'Hello, World!' : 'Program executed.'}
[Finished]`,
      cpp: `> g++ main.cpp -o main && ./main
${code.includes('cout') ? 'Hello, World!' : 'Program executed.'}
[Finished]`,
    };
    return outputs[language] || 'Execution simulation not available for this language.';
  };

  const handleRun = () => {
    if (!code.trim()) {
      toast({ title: "No code to run", variant: "destructive" });
      return;
    }
    setIsRunning(true);
    setOutput('Simulating execution...');
    setTimeout(() => {
      setOutput(simulateExecution(code, language));
      setIsRunning(false);
      toast({ title: "Execution simulated" });
    }, 1500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveForm.title || !code) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    try {
      await CodeSnippet.create({ ...saveForm, code, language, input, output, tags: saveForm.tags.split(',').map(t => t.trim()).filter(Boolean) });
      loadSnippets();
      setIsSaveDialogOpen(false);
      setSaveForm({ title: '', description: '', category: 'utility', difficulty: 'beginner', tags: '' });
      toast({ title: "Snippet saved" });
    } catch (error) {
      toast({ title: "Error saving snippet", variant: "destructive" });
    }
  };

  const loadSnippet = (snippet: any) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setInput(snippet.input || '');
    setOutput(snippet.output || '');
    toast({ title: `Loaded: ${snippet.title}` });
  };

  const deleteSnippet = async (id: string) => {
    if (confirm('Delete this snippet?')) {
      await CodeSnippet.delete(id);
      loadSnippets();
      toast({ title: "Snippet deleted" });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied" });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Code className="h-8 w-8 text-primary" />Code Playground</h1>
          <p className="text-muted-foreground">Write, run, and save code snippets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyCode}><Copy className="mr-2 h-4 w-4" />Copy</Button>
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Save className="mr-2 h-4 w-4" />Save</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Save Snippet</DialogTitle></DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <Input value={saveForm.title} onChange={e => setSaveForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" required />
                <Textarea value={saveForm.description} onChange={e => setSaveForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" />
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={handleRun} disabled={isRunning}>{isRunning ? 'Running...' : 'Run'}</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader><div className="flex justify-between items-center"><CardTitle>Code Editor</CardTitle>
              <Select value={language} onValueChange={setLanguage}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent></Select>
            </div></CardHeader>
            <CardContent><Textarea value={code} onChange={e => setCode(e.target.value)} rows={20} className="font-mono" /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Output</CardTitle><CardDescription>This is a simulated output. No code is actually executed.</CardDescription></CardHeader>
            <CardContent><pre className="bg-secondary p-4 rounded-lg font-mono text-sm min-h-[100px]">{output || 'Output will appear here...'}</pre></CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Saved Snippets</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {snippets.map(s => (
              <div key={s.id} className="p-3 border rounded-lg hover:bg-secondary">
                <div className="flex justify-between items-start"><h4 className="font-medium text-sm">{s.title}</h4><Button variant="ghost" size="sm" onClick={() => deleteSnippet(s.id)}><Trash2 className="h-3 w-3" /></Button></div>
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => loadSnippet(s)}>Load</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}