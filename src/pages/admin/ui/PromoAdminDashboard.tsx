import { AdminHeader } from "./AdminHeader";
import { DisplayOrderEditor } from "./DisplayOrderEditor";
import { PhaseOverridePanel } from "./PhaseOverridePanel";
import { SongRequestList } from "./SongRequestList";

export function PromoAdminDashboard() {
  return (
    <div className="min-h-dvh">
      <AdminHeader title="GROOVE PLAYLIST 관리자" />
      <div className="flex flex-col gap-4 px-4 py-6">
        <PhaseOverridePanel />
        <DisplayOrderEditor />
        <SongRequestList />
      </div>
    </div>
  );
}
