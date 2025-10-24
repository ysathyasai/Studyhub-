"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlashcardDeck } from '@/entities/FlashcardDeck';
import { Flashcard } from '@/entities/Flashcard';
import { Subject } from '@/entities/Subject';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Brain, Loader2, Trash2, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import FlippableCard from '@/components/flashcards/FlippableCard';

export default function FlashcardDeckDetailPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingCardData, setEditingCardData] = useState({ front: '', back: '' });

  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyCards, setStudyCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const deckId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;

  useEffect(() => {
    if (isLoggedIn && deckId) {
      fetchData();
    }
  }, [isLoggedIn, deckId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const deckData = await FlashcardDeck.get(deckId!);
      setDeck(deckData);
      
      const cardsData = await Flashcard.filter({ deckId: deckId! });
      setCards(cardsData);

      if (deckData.subjectId) {
        const subjectData = await Subject.get(deckData.subjectId);
        setSubject(subjectData);
      }
    } catch (error) {
      console.error("Error fetching deck data:", error);
      toast({ title: "Error", description: "Failed to load deck.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!newCard.front || !newCard.back) {
      toast({ title: "Missing content", description: "Both front and back of the card are required.", variant: "destructive" });
      return;
    }
    setIsSavingCard(true);
    try {
      const createdCard = await Flashcard.create({ ...newCard, deckId: deckId! });
      setCards(prev => [...prev, createdCard]);
      setDeck(prev => ({ ...prev, cardCount: (prev.cardCount || 0) + 1 }));
      await FlashcardDeck.update(deckId!, { cardCount: deck.cardCount + 1 });
      setNewCard({ front: '', back: '' });
      toast({ title: "Success", description: "Flashcard added." });
    } catch (error) {
      console.error("Error adding card:", error);
      toast({ title: "Error", description: "Failed to add card.", variant: "destructive" });
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await Flashcard.delete(cardId);
      setCards(prev => prev.filter(c => c.id !== cardId));
      setDeck(prev => ({ ...prev, cardCount: prev.cardCount - 1 }));
      await FlashcardDeck.update(deckId!, { cardCount: deck.cardCount - 1 });
      toast({ title: "Success", description: "Flashcard deleted." });
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({ title: "Error", description: "Failed to delete card.", variant: "destructive" });
    }
  };

  const handleEditCard = (card: any) => {
    setEditingCardId(card.id);
    setEditingCardData({ front: card.front, back: card.back });
  };

  const handleSaveEdit = async () => {
    if (!editingCardId) return;
    setIsSavingCard(true);
    try {
      const updatedCard = await Flashcard.update(editingCardId, editingCardData);
      setCards(prev => prev.map(c => c.id === editingCardId ? updatedCard : c));
      setEditingCardId(null);
      toast({ title: "Success", description: "Flashcard updated." });
    } catch (error) {
      console.error("Error updating card:", error);
      toast({ title: "Error", description: "Failed to update card.", variant: "destructive" });
    } finally {
      setIsSavingCard(false);
    }
  };

  const startStudySession = () => {
    setStudyCards([...cards].sort(() => Math.random() - 0.5)); // Shuffle cards
    setCurrentCardIndex(0);
    setIsStudyMode(true);
    FlashcardDeck.update(deckId!, { lastStudied: new Date().toISOString() });
  };

  const handleNextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // End of session
      setIsStudyMode(false);
      toast({ title: "Session Complete!", description: "You've reviewed all cards in this deck." });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!deck) return <div>Deck not found.</div>;

  if (isStudyMode) {
    const currentCard = studyCards[currentCardIndex];
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4 text-white">
            <h2 className="text-2xl font-bold">{deck.name} - Study Mode</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsStudyMode(false)}><X className="h-6 w-6" /></Button>
          </div>
          <FlippableCard frontContent={currentCard.front} backContent={currentCard.back} />
          <div className="mt-6 flex justify-center">
            <Button onClick={handleNextCard} size="lg">
              Next Card ({currentCardIndex + 1}/{studyCards.length})
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Button variant="ghost" onClick={() => router.push(createPageUrl('Flashcards'))} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Decks
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{deck.name}</CardTitle>
          <CardDescription>{deck.description}</CardDescription>
          {subject && <p className="text-sm text-slate-500">Subject: {subject.name}</p>}
        </CardHeader>
        <CardContent>
          <Button onClick={startStudySession} disabled={cards.length === 0}>
            <Brain className="mr-2 h-4 w-4" />
            Study this Deck ({cards.length} cards)
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="front">Front</Label>
                <Textarea id="front" placeholder="Question or term" value={newCard.front} onChange={e => setNewCard(p => ({...p, front: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="back">Back</Label>
                <Textarea id="back" placeholder="Answer or definition" value={newCard.back} onChange={e => setNewCard(p => ({...p, back: e.target.value}))} />
              </div>
              <Button onClick={handleAddCard} disabled={isSavingCard} className="w-full">
                {isSavingCard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Card
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cards in this Deck</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cards.map(card => (
                  <div key={card.id} className="p-4 border rounded-lg">
                    {editingCardId === card.id ? (
                      <div className="space-y-4">
                        <Textarea value={editingCardData.front} onChange={e => setEditingCardData(p => ({...p, front: e.target.value}))} />
                        <Textarea value={editingCardData.back} onChange={e => setEditingCardData(p => ({...p, back: e.target.value}))} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit} disabled={isSavingCard}>
                            <Save className="mr-2 h-4 w-4" /> Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCardId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold">{card.front}</p>
                        <p className="text-slate-600 mt-1">{card.back}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditCard(card)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteCard(card.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {cards.length === 0 && <p className="text-slate-500 text-center py-8">No cards in this deck yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}