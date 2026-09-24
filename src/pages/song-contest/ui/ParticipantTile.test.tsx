import { fireEvent, render, screen } from "@testing-library/react";

import { ParticipantTile } from "./ParticipantTile";

describe("ParticipantTile", () => {
  it("calls onClick and reflects the selected state via aria-pressed", () => {
    const onClick = vi.fn();
    render(<ParticipantTile name="IT대학" onClick={onClick} selected={false} />);

    const button = screen.getByRole("button", { name: "IT대학" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it("is disabled and not clickable once the vote is finalized", () => {
    const onClick = vi.fn();
    render(<ParticipantTile disabled name="IT대학" selected onClick={onClick} />);

    const button = screen.getByRole("button", { name: "IT대학" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
