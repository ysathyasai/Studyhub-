"use client";

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeckCardProps {
  deck: any;
  subject?: any;
}

export default function DeckCard({ deck, subject }: DeckCardProps) {
  return (
    <Link href={createPageUrl('FlashcardDeckDetail', { id: deck.id })}>
      <Card className="h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-transform duration-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Brain className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-800 leading-tight">{deck.name}</CardTitle>
          </div>
          <CardDescription className="text-sm text-slate-600 h-10 overflow-hidden">{deck.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {subject && (
            <Badge style={{ backgroundColor: subject.color, color: '#fff' }} className="border-none text-xs">
              {subject.name}
            </Badge>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-slate-500">
          <span>{deck.cardCount || 0} cards</span>
          {deck.lastStudied && (
            <span>Studied {formatDistanceToNow(new Date(deck.lastStudied), { addSuffix: true })}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}