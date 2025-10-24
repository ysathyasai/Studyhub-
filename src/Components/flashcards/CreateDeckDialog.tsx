"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { FlashcardDeck } from '@/entities/FlashcardDeck';
import { Loader2 } from 'lucide-react';

interface CreateDeckDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  subjects: any[];
  onDeckCreated: (newDeck: any) => void;
}

export default function CreateDeckDialog({ isOpen, setIsOpen, subjects, onDeckCreated }: CreateDeckDialogProps) {
  const [deckData, setDeckData] = useState({ name: '', description: '', subjectId: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!deckData.name) {
      toast({ title: "Name is required", description: "Please enter a name for the deck.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const newDeck = await FlashcardDeck.create(deckData);
      onDeckCreated(newDeck);
      toast({ title: "Success", description: "New deck created." });
      setIsOpen(false);
      setDeckData({ name: '', description: '', subjectId: '' });
    } catch (error) {
      console.error("Error creating deck:", error);
      toast({ title: "Error", description: "Failed to create deck.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Flashcard Deck</DialogTitle>
          <DialogDescription>
            Organize your flashcards into decks for focused study sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Deck Name</Label>
            <Input id="name" value={deckData.name} onChange={e => setDeckData(p => ({...p, name: e.target.value}))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={deckData.description} onChange={e => setDeckData(p => ({...p, description: e.target.value}))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={deckData.subjectId} onValueChange={value => setDeckData(p => ({...p, subjectId: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject (optional)" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Deck
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}