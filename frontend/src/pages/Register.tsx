import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '', full_name: '' });
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="text-indigo-400" size={28} />
            <span className="text-2xl font-bold text-white">SkillSync</span>
          </div>
          <p className="text-slate-400">Start tracking your learning momentum</p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" type="text" value={form.full_name} onChange={update('full_name')} placeholder="Jane Doe" leftIcon={<User size={16} />} />
            <Input label="Username" type="text" value={form.username} onChange={update('username')} placeholder="janedoe" leftIcon={<User size={16} />} required />
            <Input label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" leftIcon={<Mail size={16} />} required />
            <Input label="Password" type="password" value={form.password} onChange={update('password')} placeholder="8+ characters" leftIcon={<Lock size={16} />} required />
            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
