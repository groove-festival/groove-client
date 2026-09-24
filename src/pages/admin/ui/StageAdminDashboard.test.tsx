import { fireEvent, render, screen } from "@testing-library/react";

import { StageAdminDashboard } from "./StageAdminDashboard";

vi.mock("./AdminHeader", () => ({
  AdminHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));
vi.mock("./StageScheduleForm", () => ({
  StageScheduleForm: ({ section }: { section: string }) => (
    <div>{section}-schedule</div>
  ),
}));
vi.mock("./StageStoryModerationList", () => ({
  StageStoryModerationList: () => <div>story-list</div>,
}));
vi.mock("./StageVoteControlList", () => ({
  StageVoteControlList: () => <div>vote-list</div>,
}));

describe("StageAdminDashboard", () => {
  it("separates story and vote management into tabs", () => {
    render(<StageAdminDashboard />);

    expect(screen.getByText("가요제 관리자")).toBeInTheDocument();
    expect(screen.getByText("stories-schedule")).toBeInTheDocument();
    expect(screen.getByText("story-list")).toBeInTheDocument();
    expect(screen.queryByText("vote-list")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "가요제 투표 관리" }));

    expect(screen.getByText("votes-schedule")).toBeInTheDocument();
    expect(screen.getByText("vote-list")).toBeInTheDocument();
    expect(screen.queryByText("story-list")).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "가요제 투표 관리" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
