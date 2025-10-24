"use client";

import React, { useState, useEffect } from 'react';
import { QuestionBank } from '@/entities/QuestionBank';
import { Subject } from '@/entities/Subject';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, HelpCircle, Trash2, Edit, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function QuestionBankPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [banks, setBanks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', explanation: '' });

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    const [banksData, subjectsData] = await Promise.all([QuestionBank.list(), Subject.list()]);
    setBanks(banksData);
    setSubjects(subjectsData);
  };

  const handleAddQuestion = async () => {
    if (!selectedBank || !newQuestion.question || !newQuestion.correctAnswer) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    const updatedQuestions = [...(selectedBank.questions || []), newQuestion];
    const updatedBank = await QuestionBank.update(selectedBank.id, { questions: updatedQuestions, totalQuestions: updatedQuestions.length });
    setSelectedBank(updatedBank);
    setBanks(banks.map(b => b.id === updatedBank.id ? updatedBank : b));
    setNewQuestion({ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
    toast({ title: "Question added" });
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title') as string;
    const subjectId = formData.get('subjectId') as string;
    if (!title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const newBank = await QuestionBank.create({ title, subjectId, questions: [] });
    setBanks([...banks, newBank]);
    setSelectedBank(newBank);
    (e.target as HTMLFormElement).reset();
  };

  if (!isLoggedIn) return null;

  if (selectedBank) {
    return (
      <div className="p-6 space-y-6">
        <Button onClick={() => setSelectedBank(null)} variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Banks</Button>
        <h1 className="text-3xl font-bold">{selectedBank.title}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Add Question</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="Question" value={newQuestion.question} onChange={e => setNewQuestion({...newQuestion, question: e.target.value})} />
              <Select value={newQuestion.type} onValueChange={v => setNewQuestion({...newQuestion, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="short">Short Answer</SelectItem>
                </SelectContent>
              </Select>
              {newQuestion.type === 'mcq' && newQuestion.options.map((opt, i) => (
                <Input key={i} placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                  const opts = [...newQuestion.options];
                  opts[i] = e.target.value;
                  setNewQuestion({...newQuestion, options: opts});
                }} />
              ))}
              <Input placeholder="Correct Answer" value={newQuestion.correctAnswer} onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})} />
              <Textarea placeholder="Explanation (optional)" value={newQuestion.explanation} onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})} />
              <Button onClick={handleAddQuestion}>Add Question</Button>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-4">
            {selectedBank.questions?.map((q: any, i: number) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <p className="font-semibold">{i+1}. {q.question}</p>
                  <p className="text-sm text-green-500 mt-2">Answer: {q.correctAnswer}</p>
                  {q.explanation && <p className="text-sm text-muted-foreground mt-1">Explanation: {q.explanation}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><HelpCircle className="h-8 w-8 text-primary" /> Question Banks</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Create New Bank</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBank} className="space-y-4">
              <Input name="title" placeholder="Bank Title" />
              <Select name="subjectId">
                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit">Create Bank</Button>
            </form>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {banks.map(bank => (
            <Card key={bank.id} className="cursor-pointer hover:bg-secondary" onClick={() => setSelectedBank(bank)}>
              <CardHeader>
                <CardTitle>{bank.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{bank.totalQuestions || 0} questions</p>
                <p className="text-sm text-muted-foreground">{subjects.find(s => s.id === bank.subjectId)?.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}