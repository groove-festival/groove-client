import { AdminHeader } from "./AdminHeader";
import { DisplayOrderEditor } from "./DisplayOrderEditor";
import { PhaseOverridePanel } from "./PhaseOverridePanel";
import { SongRequestList } from "./SongRequestList";

export function PromoAdminDashboard() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-20 pb-6">
      <AdminHeader title="GROOVE PLAYLIST 관리자" />
      <PhaseOverridePanel />
      <DisplayOrderEditor />
      <SongRequestList />
    </div>
  );
}
