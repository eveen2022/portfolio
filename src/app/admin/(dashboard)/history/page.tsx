import { getActivity } from "@/lib/data";
import { HistoryList } from "@/components/admin/history/HistoryList";

export const dynamic = "force-dynamic";

export default async function AdminHistoryPage() {
  const activity = await getActivity();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          History
        </h1>
        <p className="text-sm text-muted">
          Every change made in this admin panel, newest first — updates live as
          changes happen, in this tab or any other.
        </p>
      </div>

      <HistoryList initial={activity} />
    </div>
  );
}
