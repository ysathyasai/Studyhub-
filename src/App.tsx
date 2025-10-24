import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './Layouts/MainLayout';
import Dashboard from './Pages/Dashboard';
import Notes from './Pages/Notes';
import NoteDetail from './Pages/NoteDetail';
import NoteEditor from './Pages/NoteEditor';
import Flashcards from './Pages/Flashcards';
import FlashcardDeckDetail from './Pages/FlashcardDeckDetail';
import Schedule from './Pages/Schedule';
import TodoLists from './Pages/TodoLists';
import CourseHub from './Pages/CourseHub';
import QuestionBank from './Pages/QuestionBank';
import FormulaReference from './Pages/FormulaReference';
import ProjectManager from './Pages/ProjectManager';
import ResearchPapers from './Pages/ResearchPapers';
import AISummarizer from './Pages/AISummarizer';
import DocumentConverter from './Pages/DocumentConverter';
import PortfolioBuilder from './Pages/PortfolioBuilder';
import ResumeMaker from './Pages/ResumeMaker';
import Scholarships from './Pages/Scholarships';
import Templates from './Pages/Templates';
import Timer from './Pages/Timer';
import CodeCompiler from './Pages/CodeCompiler';
import SBTETPortal from './Pages/SBTETPortal';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/notes" element={<MainLayout><Notes /></MainLayout>} />
      <Route path="/notes/:id" element={<MainLayout><NoteDetail /></MainLayout>} />
      <Route path="/notes/edit/:id" element={<MainLayout><NoteEditor /></MainLayout>} />
      <Route path="/notes/new" element={<MainLayout><NoteEditor /></MainLayout>} />
      <Route path="/flashcards" element={<MainLayout><Flashcards /></MainLayout>} />
      <Route path="/flashcards/:id" element={<MainLayout><FlashcardDeckDetail /></MainLayout>} />
      <Route path="/schedule" element={<MainLayout><Schedule /></MainLayout>} />
      <Route path="/todos" element={<MainLayout><TodoLists /></MainLayout>} />
      <Route path="/courses" element={<MainLayout><CourseHub /></MainLayout>} />
      <Route path="/question-bank" element={<MainLayout><QuestionBank /></MainLayout>} />
      <Route path="/formulas" element={<MainLayout><FormulaReference /></MainLayout>} />
      <Route path="/projects" element={<MainLayout><ProjectManager /></MainLayout>} />
      <Route path="/research" element={<MainLayout><ResearchPapers /></MainLayout>} />
      <Route path="/ai-summarizer" element={<MainLayout><AISummarizer /></MainLayout>} />
      <Route path="/document-converter" element={<MainLayout><DocumentConverter /></MainLayout>} />
      <Route path="/portfolio" element={<MainLayout><PortfolioBuilder /></MainLayout>} />
      <Route path="/resume" element={<MainLayout><ResumeMaker /></MainLayout>} />
      <Route path="/scholarships" element={<MainLayout><Scholarships /></MainLayout>} />
      <Route path="/templates" element={<MainLayout><Templates /></MainLayout>} />
      <Route path="/timer" element={<MainLayout><Timer /></MainLayout>} />
      <Route path="/code-compiler" element={<MainLayout><CodeCompiler /></MainLayout>} />
      <Route path="/sbtet-portal" element={<MainLayout><SBTETPortal /></MainLayout>} />
    </Routes>
  );
}

export default App;