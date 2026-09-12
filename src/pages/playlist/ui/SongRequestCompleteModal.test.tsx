import { fireEvent, render, screen } from "@testing-library/react";

import { SongRequestCompleteModal } from "./SongRequestCompleteModal";

const song = { title: "Ditto", artist: null };

describe("SongRequestCompleteModal", () => {
  it("renders nothing while closed", () => {
    render(
      <SongRequestCompleteModal
        open={false}
        song={song}
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the completed song while open", () => {
    render(
      <SongRequestCompleteModal
        open
        song={song}
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveAccessibleName(/신청이 완료되었어요/);
    expect(screen.getByText("Ditto")).toBeInTheDocument();
  });

  it("calls onChange from the 변경 button and Escape", () => {
    const onChange = vi.fn();
    render(
      <SongRequestCompleteModal
        open
        song={song}
        onChange={onChange}
        onConfirm={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "변경" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("calls onConfirm from the 확인 button", () => {
    const onConfirm = vi.fn();
    render(
      <SongRequestCompleteModal
        open
        song={song}
        onChange={() => {}}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders the album cover when one is provided", () => {
    render(
      <SongRequestCompleteModal
        open
        song={{ title: "Ditto", artist: "NewJeans", albumCoverUrl: "https://x/1" }}
        onChange={() => {}}
        onConfirm={() => {}}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector('img[src="https://x/1"]')).not.toBeNull();
    expect(screen.getByText("NewJeans")).toBeInTheDocument();
  });
});
