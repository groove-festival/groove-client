import { useState } from "react";

import { AdminHeader } from "./AdminHeader";
import { StageScheduleForm } from "./StageScheduleForm";
import { StageStoryModerationList } from "./StageStoryModerationList";
import { StageVoteControlList } from "./StageVoteControlList";

type StageAdminSection = "stories" | "votes";

const sections: { id: StageAdminSection; label: string }[] = [
  { id: "stories", label: "사연 신청 관리" },
  { id: "votes", label: "가요제 투표 관리" },
];

export function StageAdminDashboard() {
  const [activeSection, setActiveSection] = useState<StageAdminSection>("stories");

  return (
    <div className="min-h-dvh">
      <AdminHeader title="가요제 관리자" />

      <div className="flex flex-col gap-5 px-4 py-6">
        <div
          aria-label="가요제 관리 영역"
          className="grid grid-cols-2 gap-2 rounded-2xl bg-[#262626] p-1.5"
          role="tablist"
        >
          {sections.map((section) => (
            <button
              aria-controls={`stage-admin-${section.id}`}
              aria-selected={activeSection === section.id}
              className={`h-11 rounded-xl text-sm font-semibold transition-colors ${
                activeSection === section.id
                  ? "bg-[#5d00ff] text-[#fcfcfc]"
                  : "text-[#a2a2a2]"
              }`}
              id={`stage-admin-${section.id}-tab`}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              role="tab"
              type="button"
            >
              {section.label}
            </button>
          ))}
        </div>

        {activeSection === "stories" && (
          <section
            aria-labelledby="stage-admin-stories-tab"
            className="flex flex-col gap-4"
            id="stage-admin-stories"
            role="tabpanel"
          >
            <StageScheduleForm section="stories" />
            <StageStoryModerationList />
          </section>
        )}

        {activeSection === "votes" && (
          <section
            aria-labelledby="stage-admin-votes-tab"
            className="flex flex-col gap-4"
            id="stage-admin-votes"
            role="tabpanel"
          >
            <StageScheduleForm section="votes" />
            <StageVoteControlList />
          </section>
        )}
      </div>
    </div>
  );
}
