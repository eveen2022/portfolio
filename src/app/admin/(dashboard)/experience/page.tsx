import { getExperience } from "@/lib/data";
import { TimelineEditor } from "@/components/admin/timeline/TimelineEditor";

export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  const experience = await getExperience();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        Experience
      </h1>
      <div className="max-w-2xl">
        <TimelineEditor
          initial={experience}
          type="work"
          endpoint="/api/admin/experience"
        />
      </div>
    </div>
  );
}
