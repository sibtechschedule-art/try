import { useState } from 'react';
import { ScheduleProvider, useSchedule } from './context/ScheduleContext';
import { Dashboard } from './components/Dashboard';
import { ScheduleGrid } from './components/ScheduleGrid';
import { SubjectsModule } from './components/SubjectsModule';
import { TeachersModule } from './components/TeachersModule';
import { ClassroomsModule } from './components/ClassroomsModule';
import { SubstitutionDrawer } from './components/SubstitutionDrawer';
import { AIAssistantView } from './components/AIAssistantView';
import { StudentPortal } from './components/StudentPortal';
import { ExportHub } from './components/ExportHub';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  DoorClosed,
  UserCheck,
  Sparkles,
  Smartphone,
  Download
} from 'lucide-react';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { bottlenecks } = useSchedule();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Header & Clean Responsive Nav Bar */}
      <header className="bg-blue-900 border-b border-amber-500/30 sticky top-0 z-40 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 py-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-white p-1 shadow-md group-hover:scale-105 transition flex items-center justify-center">
              <img src="/logo.png" alt="SIBTECH Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-black text-amber-400 tracking-tight flex items-center gap-2">
                SIBTECH Scheduler
              </h1>
              <span className="text-[11px] font-semibold text-blue-200 block tracking-wide uppercase">
                SOUTHWESTERN INSTITUTE OF BUSINESS AND TECHNOLOGY, INC.
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-1 bg-blue-950/80 border border-blue-800/80 p-1.5 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'schedule'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <Calendar className="w-4 h-4" /> Master Schedule
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'subjects'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Subjects
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'teachers'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <Users className="w-4 h-4" /> Teachers
            </button>

            <button
              onClick={() => setActiveTab('classrooms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'classrooms'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <DoorClosed className="w-4 h-4" /> Classrooms
            </button>

            <button
              onClick={() => setActiveTab('substitutions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'substitutions'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Substitutions
            </button>

            <button
              onClick={() => setActiveTab('ai_assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition relative ${
                activeTab === 'ai_assistant'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> AI Assistant
              {bottlenecks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-blue-950">
                  {bottlenecks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('student_portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'student_portal'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Student View
            </button>

            <button
              onClick={() => setActiveTab('export_hub')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'export_hub'
                  ? 'bg-amber-500 text-blue-950 font-bold shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <Download className="w-4 h-4" /> Export & Sync
            </button>
          </nav>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'schedule' && <ScheduleGrid />}
        {activeTab === 'subjects' && <SubjectsModule />}
        {activeTab === 'teachers' && <TeachersModule />}
        {activeTab === 'classrooms' && <ClassroomsModule />}
        {activeTab === 'substitutions' && <SubstitutionDrawer />}
        {activeTab === 'ai_assistant' && <AIAssistantView />}
        {activeTab === 'student_portal' && <StudentPortal />}
        {activeTab === 'export_hub' && <ExportHub />}
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
