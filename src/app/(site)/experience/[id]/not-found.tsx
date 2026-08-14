import { NotFoundContent } from "@/components/sections/NotFoundContent";

export default function TimelineEntryNotFound() {
  return (
    <NotFoundContent
      heading="Entry not found"
      description="That experience entry doesn't exist or has been removed."
      backHref="/experience"
      backLabel="Back to experience"
    />
  );
}
