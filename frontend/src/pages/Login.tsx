import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      // error set in store
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="text-indigo-400" size={28} />
            <span className="text-2xl font-bold text-white">SkillSync</span>
          </div>
          <p className="text-slate-400">Sign in to your learning dashboard</p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              required
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
