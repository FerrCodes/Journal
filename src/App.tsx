import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { useTheme } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateEntry from './pages/CreateEntry';
import DetailEntry from './pages/DetailEntry';
import EditEntry from './pages/EditEntry';
import Stats from './pages/Stats';
import Calendar from './pages/Calendar';
import Archive from './pages/Archive';
import Settings from './pages/Settings';
import Activity from './pages/Activity';
import './i18n';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const { theme } = useTheme();
  const [activityKey, setActivityKey] = useState(0);

  const refreshActivity = () => {
    setActivityKey(prev => prev + 1);
  };

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        richColors
        expand
        closeButton
        theme={theme === 'dark' ? 'dark' : 'light'}
        toastOptions={{
          style: {
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout refreshActivity={refreshActivity} />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateEntry />} />
          <Route path="entry/:id" element={<DetailEntry />} />
          <Route path="edit/:id" element={<EditEntry />} />
          <Route path="stats" element={<Stats />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="archive" element={<Archive />} />
          <Route path="settings" element={<Settings />} />
          <Route 
            path="activity" 
            element={<Activity key={activityKey} />} // ← Tambahkan key
          />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;