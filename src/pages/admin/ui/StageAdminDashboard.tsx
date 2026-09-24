import { AdminHeader } from "./AdminHeader";
import { StageScheduleForm } from "./StageScheduleForm";
import { StageStoryModerationList } from "./StageStoryModerationList";
import { StageVoteControlList } from "./StageVoteControlList";

export function StageAdminDashboard() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-20 pb-6">
      <AdminHeader title="무대팀 관리자" />
      <StageScheduleForm />
      <StageVoteControlList />
      <StageStoryModerationList />
    </div>
  );
}
