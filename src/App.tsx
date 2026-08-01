import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'
import { useTheme } from './context/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateEntry from './pages/CreateEntry';
import DetailEntry from './pages/DetailEntry';
import EditEntry from './pages/EditEntry';
import Stats from './pages/Stats';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';

function App() {
  const { theme } = useTheme();
return (
  <BrowserRouter>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      pauseOnHover
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="create" element={<CreateEntry />} />
        <Route path="entry/:id" element={<DetailEntry />} />
        <Route path="edit/:id" element={<EditEntry />} />
        <Route path="stats" element={<Stats />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  </BrowserRouter>
);
}

export default App;