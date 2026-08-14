import { NotFoundContent } from "@/components/sections/NotFoundContent";

export default function EducationEntryNotFound() {
  return (
    <NotFoundContent
      heading="Entry not found"
      description="That education entry doesn't exist or has been removed."
      backHref="/education"
      backLabel="Back to education"
    />
  );
}
