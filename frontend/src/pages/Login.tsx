import { useState } from 'react';
import { useAuthStore } from '../store/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Bus } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('SAA8660@gmail.com');
  const [password, setPassword] = useState('123456');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
      <div className="glass-panel px-8 py-10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl w-full max-w-md relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-2xl shadow-lg flex items-center justify-center mb-4">
            <Bus className="text-white w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-slate-800">Bus Opv</h3>
          <p className="text-slate-500 font-medium tracking-wider uppercase text-xs mt-1 mb-6">Management</p>
          
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="text"
                placeholder="SAA8660@gmail.com"
                className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <button className="w-full px-6 py-3 text-white font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
