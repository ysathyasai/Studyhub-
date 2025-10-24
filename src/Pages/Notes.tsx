import React, { useState, useEffect, useMemo } from 'react';
import { Plus, BookOpen, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  isPinned?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Introduction to React',
      content: 'React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components.',
      subject: 'Web Development',
      isPinned: true,
      tags: ['react', 'javascript', 'frontend'],
      createdAt: new Date('2023-09-15'),
      updatedAt: new Date('2023-09-15')
    },
    {
      id: '2',
      title: 'Data Structures: Arrays vs Linked Lists',
      content: 'Arrays provide constant-time access but linear-time insertion and deletion. Linked lists provide linear-time access but constant-time insertion and deletion.',
      subject: 'Computer Science',
      tags: ['data structures', 'algorithms'],
      createdAt: new Date('2023-09-10'),
      updatedAt: new Date('2023-09-12')
    },
    {
      id: '3',
      title: 'Photosynthesis Process',
      content: 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water.',
      subject: 'Biology',
      tags: ['science', 'plants'],
      createdAt: new Date('2023-09-05'),
      updatedAt: new Date('2023-09-05')
    }
  ]);
  
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Web Development', color: '#3b82f6' },
    { id: '2', name: 'Computer Science', color: '#10b981' },
    { id: '3', name: 'Biology', color: '#f59e0b' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const subjectMatch = selectedSubject ? note.subject === selectedSubject : true;
        const searchMatch = searchTerm
          ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          : true;
        return subjectMatch && searchMatch;
      })
      .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  }, [notes, selectedSubject, searchTerm]);

  const onNoteDeleted = (noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="sidebar-notes" style={{width: '250px', padding: '1rem', borderRight: '1px solid #e2e8f0'}}>
        <h3 className="sidebar-section-title">SUBJECTS</h3>
        <div className="sidebar-nav">
          <div 
            className={`sidebar-link ${selectedSubject === null ? 'active' : ''}`}
            onClick={() => setSelectedSubject(null)}
          >
            <BookOpen className="sidebar-icon" size={16} />
            <span className="sidebar-text">All Notes</span>
          </div>
          {subjects.map(subject => (
            <div 
              key={subject.id}
              className={`sidebar-link ${selectedSubject === subject.name ? 'active' : ''}`}
              onClick={() => setSelectedSubject(subject.name)}
            >
              <div className="sidebar-icon" style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: subject.color
              }}></div>
              <span className="sidebar-text">{subject.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className="text-gray-500 mt-1">Organize your thoughts and key concepts.</p>
          </div>
          <Link to="/notes/new">
            <button className="create-note-btn flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
              <Plus size={16} />
              New Note
            </button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              placeholder="Search notes by title, content, or tag..."
              className="pl-10 w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="notes-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <div key={note.id} className="dashboard-card">
              <div className="card-header">
                <h3>{note.title}</h3>
                {note.isPinned && <span className="text-yellow-500">📌</span>}
              </div>
              <div className="card-content">
                <p className="mb-2">{note.content.substring(0, 100)}...</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags?.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    {note.updatedAt.toLocaleDateString()}
                  </span>
                  <Link to={`/notes/${note.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No notes found. Try adjusting your search or create a new note.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;

        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                subject={subjects.find(s => s.id === note.subjectId)}
                onNoteDeleted={onNoteDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-lg">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {notes.length > 0 ? "No notes match your search" : "No notes yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {notes.length > 0 ? "Try a different search term." : "Create your first note to get started."}
            </p>
            {notes.length === 0 && (
              <Link href={createPageUrl('NoteEditor')}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Note
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}