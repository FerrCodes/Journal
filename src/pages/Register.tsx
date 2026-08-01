import { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast.success('✅ Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error('❌ Registrasi gagal: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-6 flex items-center justify-center gap-2">
        <UserPlus className="w-6 h-6" />
        Daftar Akun
      </h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-lg transition"
        >
          {loading ? 'Loading...' : 'Daftar'}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
        Sudah punya akun? <Link to="/login" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">Login</Link>
      </p>
    </div>
  );
}

export default Register;