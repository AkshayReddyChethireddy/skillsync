import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useSkillStore } from '../../store/skillStore';
import { useUIStore } from '../../store/uiStore';
import { useDashboardStore } from '../../store/dashboardStore';

const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f97316', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'];

export function AddSkillModal() {
  const { isAddSkillOpen, closeAddSkill, addToast } = useUIStore();
  const { createSkill } = useSkillStore();
  const { invalidate, fetchAll } = useDashboardStore();
  const [form, setForm] = useState({ name: '', description: '', category: '', target_hours: 100, color: COLORS[0], icon: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await createSkill({
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        target_hours: Number(form.target_hours),
        color: form.color,
        icon: form.icon || undefined,
      });
      addToast(`"${form.name}" skill created!`);
      invalidate();
      fetchAll();
      closeAddSkill();
      setForm({ name: '', description: '', category: '', target_hours: 100, color: COLORS[0], icon: '' });
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to create skill');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isAddSkillOpen} onClose={closeAddSkill} title="Add New Skill">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-lg">{error}</p>}
        <Input label="Skill Name *" value={form.name} onChange={update('name')} placeholder="e.g. Python, Drawing, Spanish" required />
        <Input label="Description" value={form.description} onChange={update('description')} placeholder="What will you learn?" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Category" value={form.category} onChange={update('category')} placeholder="Programming" />
          <Input label="Target Hours" type="number" value={form.target_hours} onChange={update('target_hours')} min={1} max={10000} />
        </div>
        <Input label="Icon (emoji)" value={form.icon} onChange={update('icon')} placeholder="📚" />
        <div>
          <p className="text-sm font-medium text-slate-300 mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className="w-7 h-7 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: form.color === c ? 'white' : 'transparent',
                  transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={closeAddSkill}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Create Skill</Button>
        </div>
      </form>
    </Modal>
  );
}
