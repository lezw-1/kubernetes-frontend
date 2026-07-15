import { useState, useEffect } from 'react';
import Background from './Background';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ChronSorting from './chronsorting/ChronSorting';
import ImmoSearch from './immosearch/ImmoSearch';
import TravelMatch from './travelmatch/TravelMatch';
import RAG from './rag/RAG';
import OCR from './ocr/OCR';
import Promises from './promises/Promises';
import Login from './login/Login';
import Home from './home/Home';
import Sidebar from './sidebar/Sidebar';
import { hasClientRole } from './auth/roles';

// Shell — authenticated layout: sidebar + routed content area
function Shell({ token, onLogout }: { token: string; onLogout: () => void }) {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(pathname !== '/'); // Closed on home by default
  const canViewChronSorting = hasClientRole(token, 'chronsorting', 'viewer'); // Role-gated app

  // Close sidebar when navigating to home
  useEffect(() => {
    if (pathname === '/') setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} onLogout={onLogout} canViewChronSorting={canViewChronSorting} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home onLogout={onLogout} canViewChronSorting={canViewChronSorting} />} />
          <Route path="/dashboard" element={<Promises onLogout={onLogout} />} />
          <Route path="/chronsorting" element={<ChronSorting token={token} />} />
          <Route path="/immosearch" element={<ImmoSearch />} />
          <Route path="/travelmatch" element={<TravelMatch />} />
          <Route path="/rag" element={<RAG />} />
          <Route path="/ocr" element={<OCR />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Returns stored token and whether it was expired
function getInitialAuthState(): { token: string | null; expired: boolean } {
  const stored = sessionStorage.getItem('token');
  if (!stored) return { token: null, expired: false };
  try {
    const payload = JSON.parse(atob(stored.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      sessionStorage.removeItem('token');
      return { token: null, expired: true };
    }
    return { token: stored, expired: false };
  } catch {
    sessionStorage.removeItem('token');
    return { token: null, expired: false };
  }
}

const initial = getInitialAuthState();

export default function App() {
  const [token, setToken] = useState<string | null>(initial.token); // Auth token from session storage
  const [sessionExpired, setSessionExpired] = useState(initial.expired); // True when redirected due to expiry

  function handleLogin(t: string) {
    sessionStorage.setItem('token', t);
    setSessionExpired(false);
    setToken(t);
  }

  function handleLogout() {
    sessionStorage.removeItem('token');
    setToken(null);
  }

  return (
    <BrowserRouter>
      <Background />
      <Routes>
        <Route path="/login" element={
          token
            ? <Navigate to="/" replace />
            : <Login onLogin={handleLogin} sessionExpired={sessionExpired} />
        } />
        {token ? (
          <Route path="*" element={<Shell token={token} onLogout={handleLogout} />} />
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
