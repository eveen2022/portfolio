import { getEducation } from "@/lib/data";
import { TimelineEditor } from "@/components/admin/timeline/TimelineEditor";

export const dynamic = "force-dynamic";

export default async function AdminEducationPage() {
  const education = await getEducation();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        Education
      </h1>
      <div className="max-w-2xl">
        <TimelineEditor
          initial={education}
          type="education"
          endpoint="/api/admin/education"
        />
      </div>
    </div>
  );
}
