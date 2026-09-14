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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header & Clean Responsive Nav Bar */}
      <header className="bg-slate-800/90 border-b border-slate-700/80 sticky top-0 z-40 backdrop-blur-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 py-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                Schedulify
              </h1>
              <span className="text-[11px] font-medium text-slate-400 block -mt-1">
                College Timetable & Operations Engine
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-1 bg-slate-900/80 border border-slate-700/80 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" /> Master Schedule
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'subjects'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Subjects
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'teachers'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" /> Teachers
            </button>

            <button
              onClick={() => setActiveTab('classrooms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'classrooms'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <DoorClosed className="w-4 h-4" /> Classrooms
            </button>

            <button
              onClick={() => setActiveTab('substitutions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'substitutions'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Substitutions
            </button>

            <button
              onClick={() => setActiveTab('ai_assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition relative ${
                activeTab === 'ai_assistant'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> AI Assistant
              {bottlenecks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {bottlenecks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('student_portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'student_portal'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Student View
            </button>

            <button
              onClick={() => setActiveTab('export_hub')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'export_hub'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
