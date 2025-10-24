import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../Styles/globals.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Notes", path: "/notes", icon: "📝" },
    { name: "Flashcards", path: "/flashcards", icon: "🧠" },
    { name: "Study Timer", path: "/timer", icon: "⏱️" },
    { name: "Schedule", path: "/schedule", icon: "📅" },
    { name: "Todo Lists", path: "/todos", icon: "✅" },
  ];

  const tools = [
    { name: "Resume Maker", path: "/resume", icon: "👤" },
    { name: "Document Converter", path: "/document-converter", icon: "📄" },
    { name: "AI Summarizer", path: "/ai-summarizer", icon: "🤖" },
    { name: "Research Papers", path: "/research", icon: "📚" },
    { name: "Code Compiler", path: "/code-compiler", icon: "💻" },
    { name: "Formula Reference", path: "/formulas", icon: "🔢" },
    { name: "Portfolio Builder", path: "/portfolio", icon: "🎨" },
    { name: "Scholarships", path: "/scholarships", icon: "🎓" },
    { name: "SBTET Portal", path: "/sbtet-portal", icon: "🏫" },
  ];

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title">StudyHub</h1>
        </div>
        
        <div className="sidebar-section">
          <h2 className="sidebar-section-title">Main</h2>
          <nav className="sidebar-nav">
            {navigation.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`sidebar-link ${currentPath === item.path ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="sidebar-section">
          <h2 className="sidebar-section-title">Tools</h2>
          <nav className="sidebar-nav">
            {tools.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`sidebar-link ${currentPath === item.path ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="main-content">
        <header className="content-header">
          <h1 className="page-title">
            {navigation.find(item => item.path === currentPath)?.name || 
             tools.find(item => item.path === currentPath)?.name || 
             "StudyHub"}
          </h1>
          <div className="user-profile">
            <span className="user-name">User</span>
            <div className="avatar">👤</div>
          </div>
        </header>
        
        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;