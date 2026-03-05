import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSkillStore } from '../store/skillStore';
import { useProgressStore } from '../store/progressStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useUIStore } from '../store/uiStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { todayISO, formatMomentumBand } from '../utils/formatters';
import { getErrorMessage } from '../api/client';

const RATINGS = [1, 2, 3, 4, 5];

export function LogProgress() {
  const { skills, fetchSkills } = useSkillStore();
  const { logSession, isSubmitting } = useProgressStore();
  const { invalidate, fetchAll } = useDashboardStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    skill_id: '',
    session_date: todayISO(),
    duration_minutes: 30,
    notes: '',
    difficulty: 0,
    mood: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!skills.length) fetchSkills();
  }, []);

  const update = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skill_id) { setError('Please select a skill'); return; }
    setError('');
    try {
      await logSession({
        skill_id: form.skill_id,
        session_date: form.session_date,
        duration_minutes: Number(form.duration_minutes),
        notes: form.notes || undefined,
        difficulty: form.difficulty || undefined,
        mood: form.mood || undefined,
      });
      addToast('Session logged successfully!');
      invalidate();
      fetchAll();
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!skills.length) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const selectedSkill = skills.find((s) => s.id === form.skill_id);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Log Session</h1>
      <p className="text-slate-400 text-sm mb-8">Record your learning session to track momentum</p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 rounded-xl border border-slate-700 p-6"
      >
        {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Skill Select */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Skill *</label>
            <select
              value={form.skill_id}
              onChange={(e) => update('skill_id', e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a skill...</option>
              {skills.filter((s) => s.is_active).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Selected skill momentum */}
          {selectedSkill?.metrics && (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-900/50">
              <span className="text-slate-400">Current momentum:</span>
              <span style={{ color: formatMomentumBand(selectedSkill.metrics.momentum_score).color }} className="font-semibold">
                {Math.round(selectedSkill.metrics.momentum_score)} — {formatMomentumBand(selectedSkill.metrics.momentum_score).label}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={form.session_date}
              onChange={(e) => update('session_date', e.target.value)}
              max={todayISO()}
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={form.duration_minutes}
              onChange={(e) => update('duration_minutes', e.target.value)}
              min={1}
              max={1440}
              required
            />
          </div>

          <Input
            label="Notes (optional)"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="What did you work on?"
          />

          {/* Ratings */}
          {(['difficulty', 'mood'] as const).map((field) => (
            <div key={field}>
              <p className="text-sm font-medium text-slate-300 mb-2 capitalize">{field} (optional)</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => update(field, 0)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${form[field] === 0 ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                  Skip
                </button>
                {RATINGS.map((r) => (
                  <button key={r} type="button" onClick={() => update(field, r)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${form[field] === r ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Log Session
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
