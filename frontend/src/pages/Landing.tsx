import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Activity, Target, BarChart3, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Activity, title: 'Momentum Scores', desc: 'Quantified learning momentum based on recency, consistency, volume, and acceleration.' },
  { icon: Flame, title: 'Streak Tracking', desc: 'Daily practice streaks with grace periods so missing one day doesn\'t break your flow.' },
  { icon: TrendingUp, title: 'Stagnation Alerts', desc: 'Automatic detection when you\'ve neglected a skill, with severity levels.' },
  { icon: Target, title: 'Progress to Goal', desc: 'Set target hours per skill and track your journey to mastery.' },
  { icon: BarChart3, title: 'Rich Analytics', desc: 'GitHub-style heatmaps, momentum charts, and weekly distribution analysis.' },
  { icon: Zap, title: 'Session Logging', desc: 'Log study sessions with duration, difficulty ratings, and personal notes.' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-400" size={22} />
            <span className="text-xl font-bold">SkillSync</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm transition-colors">Sign In</Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-400 text-sm mb-6">
            <Zap size={14} />
            Learning Momentum Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Track skills that
            <span className="text-indigo-400"> actually matter</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            SkillSync measures your learning momentum, detects when you're stagnating,
            and gives you the analytics to answer: "Am I improving?"
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors">
              Start for free
            </Link>
            <Link to="/login" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors">
              Sign in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to level up</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4">
                <Icon className="text-indigo-400" size={20} />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>Built with FastAPI + React · Production-ready SaaS architecture</p>
      </footer>
    </div>
  );
}
