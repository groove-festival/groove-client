import { render, screen } from "@testing-library/react";

import { ParticipantChip } from "./ParticipantChip";
import { ParticipantTile } from "./ParticipantTile";

describe("participant photos", () => {
  it("shows the team photo next to the name", () => {
    render(<ParticipantChip name="치이카와" />);

    expect(screen.getByTestId("participant-avatar")).toHaveAttribute(
      "srcset",
      expect.stringContaining("3x"),
    );
    expect(screen.getByText("치이카와")).toBeInTheDocument();
  });

  it("dims the photo of an unselected participant", () => {
    render(<ParticipantTile name="테리" selected={false} />);

    expect(screen.getByTestId("participant-avatar")).toHaveClass("grayscale");
  });

  it("falls back to an empty circle for a name without a photo", () => {
    render(<ParticipantChip name="미정" />);

    expect(screen.queryByTestId("participant-avatar")).not.toBeInTheDocument();
  });
});
