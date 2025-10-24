import React from "react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  // Mock data for dashboard
  const recentNotes = [
    { id: '1', title: 'Computer Science Fundamentals', date: '2023-06-15' },
    { id: '2', title: 'Data Structures Notes', date: '2023-06-10' },
    { id: '3', title: 'Web Development Basics', date: '2023-06-05' },
  ];

  const upcomingEvents = [
    { id: '1', title: 'Final Exam - Mathematics', date: '2023-07-15', time: '10:00 AM' },
    { id: '2', title: 'Group Study - Physics', date: '2023-06-25', time: '2:00 PM' },
    { id: '3', title: 'Project Submission', date: '2023-07-01', time: '11:59 PM' },
  ];

  const todoItems = [
    { id: '1', title: 'Complete assignment', completed: false },
    { id: '2', title: 'Review lecture notes', completed: true },
    { id: '3', title: 'Prepare for presentation', completed: false },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h2>Welcome to StudyHub!</h2>
        <p>Your personal academic assistant. Organize notes, create flashcards, manage schedules, and more.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Notes</h3>
            <Link to="/notes" className="view-all">View All</Link>
          </div>
          <div className="card-content">
            {recentNotes.map(note => (
              <div key={note.id} className="list-item">
                <Link to={`/notes/${note.id}`} className="item-title">{note.title}</Link>
                <span className="item-date">{note.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Upcoming Events</h3>
            <Link to="/schedule" className="view-all">View All</Link>
          </div>
          <div className="card-content">
            {upcomingEvents.map(event => (
              <div key={event.id} className="list-item">
                <div className="item-title">{event.title}</div>
                <div className="item-details">
                  <span className="item-date">{event.date}</span>
                  <span className="item-time">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Todo List</h3>
            <Link to="/todos" className="view-all">View All</Link>
          </div>
          <div className="card-content">
            {todoItems.map(item => (
              <div key={item.id} className="list-item todo-item">
                <span className={`item-title ${item.completed ? 'completed' : ''}`}>
                  {item.title}
                </span>
                <span className="todo-status">
                  {item.completed ? '✅' : '⬜'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Quick Tools</h3>
          </div>
          <div className="card-content tools-grid">
            <Link to="/flashcards" className="tool-item">
              <span className="tool-icon">🧠</span>
              <span className="tool-name">Flashcards</span>
            </Link>
            <Link to="/timer" className="tool-item">
              <span className="tool-icon">⏱️</span>
              <span className="tool-name">Study Timer</span>
            </Link>
            <Link to="/ai-summarizer" className="tool-item">
              <span className="tool-icon">🤖</span>
              <span className="tool-name">AI Summarizer</span>
            </Link>
            <Link to="/formulas" className="tool-item">
              <span className="tool-icon">🔢</span>
              <span className="tool-name">Formula Reference</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    weeklyStudyTime: 0,
    notesCount: 0,
    flashcardDecks: 0,
    todayEvents: 0,
    weeklyGoal: 1200, // 20 hours in minutes
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadDashboardData();
  }, [isLoggedIn]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [
        sessionsData,
        notesData,
        decksData,
        eventsData,
        subjectsData
      ] = await Promise.all([
        StudySession.list("createdAt:desc", 50),
        Note.list("createdAt:desc", 10),
        FlashcardDeck.list("createdAt:desc"),
        ScheduleEvent.list("date:desc", 20),
        Subject.list("createdAt:desc")
      ]);

      setSubjects(subjectsData);

      // Calculate stats
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);

      const totalStudyTime = sessionsData
        .filter((s: any) => s.completed && s.type === 'focus')
        .reduce((sum: number, s: any) => sum + s.duration, 0);

      const weeklyStudyTime = sessionsData
        .filter((s: any) => {
          const sessionDate = new Date(s.date);
          return s.completed && s.type === 'focus' && 
                 sessionDate >= weekStart && sessionDate <= weekEnd;
        })
        .reduce((sum: number, s: any) => sum + s.duration, 0);

      const todayEventsFiltered = eventsData.filter((e: any) => 
        isToday(new Date(e.date))
      );

      setStats({
        totalStudyTime,
        weeklyStudyTime,
        notesCount: notesData.length,
        flashcardDecks: decksData.length,
        todayEvents: todayEventsFiltered.length,
        weeklyGoal: 1200
      });

      setRecentSessions(sessionsData.slice(0, 5));
      setTodayEvents(todayEventsFiltered.slice(0, 3));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const weeklyProgress = Math.min((stats.weeklyStudyTime / stats.weeklyGoal) * 100, 100);

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-muted/50 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-card rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your progress and stay focused on your goals</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={createPageUrl("Timer")}>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlayCircle className="h-4 w-4" />
              Start Study Session
            </Button>
          </Link>
          <Link href={createPageUrl("Notes")}>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Quick Note
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Study Time</p>
                <p className="text-2xl font-bold text-foreground">{formatTime(stats.totalStudyTime)}</p>
              </div>
              <div className="p-3 bg-primary rounded-lg">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes Created</p>
                <p className="text-2xl font-bold text-foreground">{stats.notesCount}</p>
              </div>
              <div className="p-3 bg-primary rounded-lg">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flashcard Decks</p>
                <p className="text-2xl font-bold text-foreground">{stats.flashcardDecks}</p>
              </div>
              <div className="p-3 bg-primary rounded-lg">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Events</p>
                <p className="text-2xl font-bold text-foreground">{stats.todayEvents}</p>
              </div>
              <div className="p-3 bg-primary rounded-lg">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Weekly Study Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                {formatTime(stats.weeklyStudyTime)} of {formatTime(stats.weeklyGoal)}
              </span>
              <Badge variant={weeklyProgress >= 100 ? "default" : "secondary"}>
                {Math.round(weeklyProgress)}%
              </Badge>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            {weeklyProgress >= 100 && (
              <div className="flex items-center gap-2 text-green-500">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">Goal achieved! Great work!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Study Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Recent Study Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No study sessions yet</p>
                <Link href={createPageUrl("Timer")}>
                  <Button size="sm">Start Your First Session</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => {
                  const subject = subjects.find(s => s.id === session.subjectId);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          session.completed ? 'bg-green-500/20 text-green-400' : 'bg-secondary text-muted-foreground'
                        }`}>
                          <Timer className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {subject?.name || 'General Study'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.startTime), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{formatTime(session.duration)}</p>
                        <Badge variant={session.completed ? "default" : "secondary"} className={`text-xs ${session.completed ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}`}>
                          {session.completed ? 'Completed' : 'Incomplete'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No events scheduled for today</p>
                <Link href={createPageUrl("Schedule")}>
                  <Button size="sm">Add Event</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => {
                  const subject = subjects.find(s => s.id === event.subjectId);
                  return (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          event.type === 'exam' ? 'bg-red-500/20 text-red-400' :
                          event.type === 'assignment' ? 'bg-orange-500/20 text-orange-400' :
                          event.type === 'class' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          <BookMarked className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {subject?.name || 'General'} • {format(new Date(event.startTime), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href={createPageUrl("Notes")}>
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <BookOpen className="h-6 w-6" />
                <span>Create Note</span>
              </Button>
            </Link>
            <Link href={createPageUrl("Flashcards")}>
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Brain className="h-6 w-6" />
                <span>Study Cards</span>
              </Button>
            </Link>
            <Link href={createPageUrl("Timer")}>
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Timer className="h-6 w-6" />
                <span>Focus Timer</span>
              </Button>
            </Link>
            <Link href={createPageUrl("Schedule")}>
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Calendar className="h-6 w-6" />
                <span>Schedule</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}