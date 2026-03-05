import { useEffect } from 'react';
import { Plus, Brain } from 'lucide-react';
import { useSkillStore } from '../store/skillStore';
import { useUIStore } from '../store/uiStore';
import { SkillCard } from '../components/skills/SkillCard';
import { AddSkillModal } from '../components/skills/AddSkillModal';
import { EditSkillModal } from '../components/skills/EditSkillModal';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

export function Skills() {
  const { skills, isLoading, fetchSkills, deleteSkill } = useSkillStore();
  const { openAddSkill, openEditSkill, addToast } = useUIStore();

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Archive this skill? You can reactivate it later.')) return;
    await deleteSkill(id);
    addToast('Skill archived', 'info');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-slate-400 text-sm mt-1">{skills.length} skill{skills.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <Button onClick={openAddSkill}>
          <Plus size={16} />
          Add Skill
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : skills.length === 0 ? (
        <EmptyState
          icon={<Brain size={48} />}
          title="No skills yet"
          description="Add your first skill to start tracking your learning momentum."
          action={<Button onClick={openAddSkill}><Plus size={16} />Add Your First Skill</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill, i) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              index={i}
              onEdit={openEditSkill}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddSkillModal />
      <EditSkillModal />
    </div>
  );
}
