"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Subject } from '@/entities/Subject';
import { StudySession } from '@/entities/StudySession';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function TimerPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
    }
    if (isLoggedIn) {
      Subject.list().then(setSubjects);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionEnd();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleSessionEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    audioRef.current?.play();

    if (mode === 'focus' && sessionStartTime) {
      const duration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60));
      StudySession.create({
        subjectId: selectedSubject || undefined,
        type: 'focus',
        duration: duration,
        plannedDuration: FOCUS_TIME / 60,
        startTime: sessionStartTime.toISOString(),
        endTime: new Date().toISOString(),
        completed: true,
        date: sessionStartTime.toISOString().split('T')[0],
      });
      toast({ title: "Focus session complete!", description: "Time for a break." });
    }
    
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const toggleTimer = () => {
    if (!isActive && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setMode('focus');
    setTimeLeft(FOCUS_TIME);
    setSessionStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((mode === 'focus' ? FOCUS_TIME : BREAK_TIME) - timeLeft) / (mode === 'focus' ? FOCUS_TIME : BREAK_TIME) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-foreground">
            {mode === 'focus' ? 'Study Session' : 'Break Time'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <div className="relative h-64 w-64">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle className="stroke-current text-muted" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent" />
              <circle
                className="stroke-current text-primary transition-all duration-1000"
                strokeWidth="7"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                strokeDasharray="282.74"
                strokeDashoffset={282.74 - (progress / 100) * 282.74}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-foreground">{formatTime(timeLeft)}</div>
              {mode === 'focus' ? <Brain className="h-8 w-8 text-muted-foreground mt-2" /> : <Coffee className="h-8 w-8 text-muted-foreground mt-2" />}
            </div>
          </div>

          <div className="w-full space-y-4">
            <Select value={selectedSubject || ''} onValueChange={setSelectedSubject} disabled={isActive}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject (optional)" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={toggleTimer}>
                {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                {isActive ? 'Pause' : 'Start'}
              </Button>
              <Button size="lg" variant="outline" onClick={resetTimer}>
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}