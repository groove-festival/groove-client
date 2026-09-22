import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import SongContestPage from "./SongContestPage";

const renderPage = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <SongContestPage />
    </MemoryRouter>,
  );

describe("SongContestPage preview", () => {
  it("shows a closed form before collection and after collection", () => {
    const before = renderPage("/contest");
    expect(screen.getByText("사연 모집이 아직이에요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "신청하기" })).not.toBeInTheDocument();
    before.unmount();

    renderPage("/contest?phase=closed");
    expect(screen.getByText("사연 모집이 끝났어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "신청하기" })).not.toBeInTheDocument();
  });

  it("switches the two overview tabs without leaving the page", () => {
    renderPage("/contest?phase=open");
    fireEvent.click(screen.getByRole("tab", { name: "경연 목록" }));
    expect(screen.getByText("경연 목록은 연동 후 표시됩니다")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "타임테이블" }));
    expect(screen.getByText("가요제 오프닝")).toBeInTheDocument();
  });

  it("validates the form and labels completion as a preview", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderPage("/contest?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "신청하기" }));
    expect(
      screen.getByRole("dialog", { name: "사연 신청 안내 사항" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "작성 화면 미리보기" }));
    fireEvent.click(screen.getByRole("button", { name: "접수 완료 화면 미리보기" }));
    expect(await screen.findByText("단대를 선택해 주세요.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "IT" }));
    fireEvent.change(screen.getByRole("textbox", { name: "학과 *" }), {
      target: { value: "컴퓨터학부" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "학번 *" }), {
      target: { value: "20241234" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "이름 *" }), {
      target: { value: "홍길동" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "사연 제목 *" }), {
      target: { value: "축제 이야기" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "사연 내용 *" }), {
      target: { value: "함께 노래해요." },
    });
    fireEvent.click(screen.getByRole("button", { name: "접수 완료 화면 미리보기" }));
    await waitFor(() =>
      expect(
        screen.getByText("실제 접수가 아닌 완료 화면 미리보기입니다"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("status")).toHaveTextContent("실제 접수는 연결 전");
  });
});
