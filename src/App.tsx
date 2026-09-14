import { ScheduleProvider, useSchedule } from './context/ScheduleContext';
import { Dashboard } from './components/Dashboard';
import { ScheduleGrid } from './components/ScheduleGrid';
import { SubjectsModule } from './components/SubjectsModule';
import { TeachersModule } from './components/TeachersModule';
import { ClassroomsModule } from './components/ClassroomsModule';
import { SettingsModule } from './components/SettingsModule';
import { SubstitutionDrawer } from './components/SubstitutionDrawer';
import { AIAssistantView } from './components/AIAssistantView';
import { StudentPortal } from './components/StudentPortal';
import { ExportHub } from './components/ExportHub';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  School,
  UserCheck,
  Bot,
  Smartphone,
  Download,
  Sliders,
  Sparkles
} from 'lucide-react';
import './App.css';

function MainLayout() {
  const { activeTab, setActiveTab, bottlenecks } = useSchedule();

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar no-print">
        <div className="brand" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-logo-icon">
            <Sparkles className="icon" />
          </div>
          <div>
            <h1 className="brand-title">ScheduleAI Master</h1>
            <span className="brand-tag">Automated School Timetable Engine</span>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard className="tab-icon" /> Dashboard
          </button>

          <button
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar className="tab-icon" /> Master Schedule
          </button>

          <button
            className={`tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <BookOpen className="tab-icon" /> Subjects
          </button>

          <button
            className={`tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            <Users className="tab-icon" /> Teachers
          </button>

          <button
            className={`tab-btn ${activeTab === 'classrooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('classrooms')}
          >
            <School className="tab-icon" /> Classrooms
          </button>

          <button
            className={`tab-btn ${activeTab === 'substitute' ? 'active' : ''}`}
            onClick={() => setActiveTab('substitute')}
          >
            <UserCheck className="tab-icon" /> Substitutions
          </button>

          <button
            className={`tab-btn ${activeTab === 'assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('assistant')}
          >
            <Bot className="tab-icon" /> AI Assistant
            {bottlenecks.length > 0 && <span className="nav-badge-amber">{bottlenecks.length}</span>}
          </button>

          <button
            className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
          >
            <Smartphone className="tab-icon" /> Student Portal
          </button>

          <button
            className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <Download className="tab-icon" /> Export & Sync
          </button>

          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Sliders className="tab-icon" /> Settings
          </button>
        </nav>
      </header>

      {/* Main Active Tab Content View */}
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'schedule' && <ScheduleGrid />}
        {activeTab === 'subjects' && <SubjectsModule />}
        {activeTab === 'teachers' && <TeachersModule />}
        {activeTab === 'classrooms' && <ClassroomsModule />}
        {activeTab === 'substitute' && <SubstitutionDrawer />}
        {activeTab === 'assistant' && <AIAssistantView />}
        {activeTab === 'student' && <StudentPortal />}
        {activeTab === 'export' && <ExportHub />}
        {activeTab === 'settings' && <SettingsModule />}
      </main>
    </div>
  );
}

export function App() {
  return (
    <ScheduleProvider>
      <MainLayout />
    </ScheduleProvider>
  );
}

export default App;
