import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import banner from '../assets/guindaste.png';
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Falha ao fazer login. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col md:flex-row animate-in fade-in duration-500">
      {/* Sidebar/Banner for Desktop - Hidden on small mobile */}
      <div
        className="hidden md:flex w-full md:w-1/3 h-[250px] md:h-screen bg-cover bg-center relative items-center justify-center"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute inset-0 bg-[#004a7c]/95 backdrop-blur-[2px]"></div>
        <img src={logo} alt="Ribas Guindastes" className="w-48 h-48 object-contain drop-shadow-2xl relative z-10" />
      </div>

      {/* Mobile-only header equivalent */}
      <div
        className="md:hidden h-[250px] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img src={logo} alt="Ribas Guindastes" className="w-32 h-32 object-contain drop-shadow-2xl" />
        </div>
      </div>

      <main className="-mt-10 md:mt-0 flex-1 bg-[#f4f4f4] rounded-t-[40px] md:rounded-none min-h-[calc(100vh-210px)] md:min-h-screen px-6 py-10 md:py-20 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] md:shadow-none flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 hidden md:block">Bem-vindo à Guindastes Ribas</h1>
          <h1 className="text-3xl font-bold text-gray-900 mb-8 md:hidden">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm shadow-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 ml-1">Email</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[60px] rounded-xl border border-gray-200 bg-white px-5 pl-12 text-lg focus:border-[#004a7c] focus:ring-2 focus:ring-[#004a7c]/20 outline-none transition-all"
                  placeholder="nome@empresa.com"
                />
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 ml-1">Senha</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[60px] rounded-xl border border-gray-200 bg-white px-5 pl-12 pr-12 text-lg focus:border-[#004a7c] focus:ring-2 focus:ring-[#004a7c]/20 outline-none transition-all"
                  placeholder="••••••••"
                />
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004a7c] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[60px] bg-[#004a7c] hover:bg-[#00365a] active:scale-[0.98] text-white text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'Entrar'}
            </button>

            <button
              type="button"
              className="w-full h-[50px] text-[#004a7c] font-medium hover:underline transition-all"
            >
              Esqueceu sua senha?
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;