import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';  // ← Import Toaster
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
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const { theme } = useTheme();
  return (
    <BrowserRouter>
      {/* Hapus ToastContainer, ganti dengan Toaster */}
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateEntry />} />
          <Route path="entry/:id" element={<DetailEntry />} />
          <Route path="edit/:id" element={<EditEntry />} />
          <Route path="stats" element={<Stats />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="archive" element={<Archive />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;