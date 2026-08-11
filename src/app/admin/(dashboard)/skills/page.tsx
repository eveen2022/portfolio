import { getSkills } from "@/lib/data";
import { SkillsEditor } from "@/components/admin/skills/SkillsEditor";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const skills = await getSkills();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        Skills
      </h1>
      <div className="max-w-2xl">
        <SkillsEditor initial={skills} />
      </div>
    </div>
  );
}
