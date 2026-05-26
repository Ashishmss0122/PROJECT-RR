const message = {"text": "Install completed successfully."};
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-darkBg flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyanAccent/5 rounded-full glow-blur -z-10 animate-pulse"></div>

      <div className="w-full max-w-md">
        <GlassCard className="border border-white/5 shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>

          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold tracking-tight text-white mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-950" />
              </div>
              <span>Secure<span className="text-cyan-400 font-extrabold">Freelance</span></span>
            </Link>
            <h2 className="text-lg font-medium text-slate-400">Welcome back. Access your workspace.</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-sm flex items-start space-x-2 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-lg transition-colors placeholder-slate-600"
                  placeholder="name@example.com"
                />
                <Mail className="w-4.5 h-4.5 text-slate-600 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-lg transition-colors placeholder-slate-600"
                  placeholder="••••••••"
                />
                <Lock className="w-4.5 h-4.5 text-slate-600 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-cyan-400 hover:underline">
              Create one here
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
