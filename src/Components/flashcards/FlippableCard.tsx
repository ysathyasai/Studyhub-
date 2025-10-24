"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface FlippableCardProps {
  frontContent: string;
  backContent: string;
}

export default function FlippableCard({ frontContent, backContent }: FlippableCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full h-80 perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden bg-card rounded-xl shadow-2xl flex items-center justify-center p-6 text-center">
          <p className="text-2xl font-semibold text-card-foreground">{frontContent}</p>
        </div>

        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden bg-primary text-primary-foreground rounded-xl shadow-2xl flex items-center justify-center p-6 text-center rotate-y-180">
          <p className="text-xl">{backContent}</p>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <Button variant="secondary" onClick={handleFlip}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Flip Card
        </Button>
      </div>
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
}