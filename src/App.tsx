// ============================================================
// QuantumLearn AI — Main App Component
// Wrapped in Supabase AuthProvider with protected routes and cloud sync
// ============================================================

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './core/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Layout/Navbar';
import { TutorPanel } from './components/AITutor/TutorPanel';
import { LandingPage } from './pages/LandingPage';
import { LabPage } from './pages/LabPage';
import { ModulePage } from './pages/ModulePage';
import { ChallengePage } from './pages/ChallengePage';
import { ProfilePage } from './pages/ProfilePage';
import { ProblemsPage } from './pages/ProblemsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AuthPage } from './pages/AuthPage';
import { useProgressStore } from './core/store';
import { useProfileStore } from './core/profileStore';
import { syncProblemsFromSupabase, syncProblemsProgressFromSupabase } from './data/problems/problemsData';
import { syncReadAnnouncementsFromSupabase } from './data/announcementsData';
import { supabase } from './lib/supabase';
import { purgeLegacyMockData } from './lib/db';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const loadProgress = useProgressStore((s) => s.loadProgress);
  const loadProfile = useProfileStore((s) => s.loadProfile);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        purgeLegacyMockData(user.id).finally(() => {
          loadProgress();
          loadProfile();
          syncProblemsFromSupabase();
          syncProblemsProgressFromSupabase();
        });
      } else {
        loadProgress();
        loadProfile();
        syncProblemsFromSupabase();
        syncProblemsProgressFromSupabase();
      }
    });
    syncReadAnnouncementsFromSupabase();
  }, [loadProgress, loadProfile]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-[var(--void)] text-[var(--ink)] flex flex-col transition-colors duration-250">
        <Navbar />
        <main className="flex-1 flex flex-col min-h-0">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/learn/:moduleId" element={<ModulePage />} />
            <Route path="/challenge/:challengeId" element={<ChallengePage />} />
            <Route
              path="/problems"
              element={
                <ProtectedRoute>
                  <ProblemsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <TutorPanel />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
