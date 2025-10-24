import React, { useState, useMemo } from 'react';
import { Plus, Brain, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  subject: string;
  cards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardsPage: React.FC = () => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([
    {
      id: '1',
      title: 'React Fundamentals',
      description: 'Basic concepts of React',
      subject: 'Web Development',
      cards: [
        { id: '101', front: 'What is React?', back: 'A JavaScript library for building user interfaces' },
        { id: '102', front: 'What is JSX?', back: 'A syntax extension for JavaScript that looks similar to HTML' },
        { id: '103', front: 'What is a component?', back: 'A reusable piece of code that returns React elements' }
      ],
      createdAt: new Date('2023-09-01'),
      updatedAt: new Date('2023-09-10')
    },
    {
      id: '2',
      title: 'Data Structures',
      description: 'Common data structures in computer science',
      subject: 'Computer Science',
      cards: [
        { id: '201', front: 'What is an array?', back: 'A collection of elements identified by index' },
        { id: '202', front: 'What is a linked list?', back: 'A linear collection of elements where each element points to the next' },
        { id: '203', front: 'What is a stack?', back: 'A LIFO (Last In, First Out) data structure' }
      ],
      createdAt: new Date('2023-08-15'),
      updatedAt: new Date('2023-09-05')
    },
    {
      id: '3',
      title: 'Biology Terms',
      description: 'Important biology terminology',
      subject: 'Biology',
      cards: [
        { id: '301', front: 'What is photosynthesis?', back: 'The process by which plants use sunlight to synthesize foods from carbon dioxide and water' },
        { id: '302', front: 'What is cellular respiration?', back: 'The process by which cells break down glucose to produce energy' }
      ],
      createdAt: new Date('2023-07-20'),
      updatedAt: new Date('2023-08-25')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredDecks = useMemo(() => {
    return decks.filter(deck =>
      deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [decks, searchTerm]);

  const subjects = Array.from(new Set(decks.map(deck => deck.subject)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flashcard Decks</h1>
          <p className="text-gray-500 mt-1">Master concepts with spaced repetition.</p>
        </div>
        <Link to="/flashcards/new">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
            <Plus className="h-4 w-4" />
            New Deck
          </button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            placeholder="Search decks..."
            className="pl-10 w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map(deck => (
            <div key={deck.id} className="dashboard-card">
              <div className="card-header">
                <h3>{deck.title}</h3>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{deck.cards.length} cards</span>
              </div>
              <div className="card-content">
                <p className="mb-2">{deck.description}</p>
                <div className="text-sm text-gray-500 mb-3">
                  Subject: {deck.subject}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    Updated {deck.updatedAt.toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/flashcards/${deck.id}/study`} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                      Study
                    </Link>
                    <Link to={`/flashcards/${deck.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-lg">
          <Brain className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No flashcard decks found
          </h3>
          <p className="text-slate-600 mb-6">
            Create your first deck or adjust your search.
          </p>
          <Link to="/flashcards/new">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded mx-auto">
              <Plus className="h-4 w-4" />
              Create New Deck
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
            {decks.length > 0 ? "No decks match your search" : "No flashcard decks yet"}
          </h3>
          <p className="text-slate-500 mb-6">
            {decks.length > 0 ? "Try a different search term." : "Create your first deck to start studying."}
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Deck
          </Button>
        </div>
      )}

      <CreateDeckDialog
        isOpen={isCreateDialogOpen}
        setIsOpen={setCreateDialogOpen}
        subjects={subjects}
        onDeckCreated={handleDeckCreated}
      />
    </div>
  );
}