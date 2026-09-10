import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { SongRequestForm } from "./SongRequestForm";

const renderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<SongRequestForm />, { wrapper });
};

const fillRequiredFields = (studentId: string) => {
  fireEvent.change(screen.getByLabelText(/음악 검색/), {
    target: { value: "Ditto" },
  });
  fireEvent.change(screen.getByLabelText("학번"), {
    target: { value: studentId },
  });
  fireEvent.change(screen.getByLabelText("학과"), {
    target: { value: "컴퓨터학부" },
  });
  fireEvent.change(screen.getByLabelText("이름"), {
    target: { value: "김그루브" },
  });
  fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "gv" } });
};

const submit = () => fireEvent.click(screen.getByRole("button", { name: "신청하기" }));

describe("SongRequestForm", () => {
  it("blocks submission and shows the first validation message when fields are missing", async () => {
    renderForm();

    submit();

    expect(await screen.findByText("곡명을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a student-id specific message when only the student id is invalid", async () => {
    renderForm();
    fillRequiredFields("202500");

    submit();

    expect(
      await screen.findByText("학번을 숫자 10자리로 입력해 주세요."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("submits and opens the completion popup with the requested song", async () => {
    renderForm();
    fillRequiredFields("3025000001");

    submit();

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName(/신청이 완료되었어요/);
    expect(screen.getByText("Ditto")).toBeInTheDocument();
  });

  it("keeps the form values when 변경 is pressed", async () => {
    renderForm();
    fillRequiredFields("3025000002");
    submit();
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "변경" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("이름")).toHaveValue("김그루브");
  });

  it("clears the form when 확인 is pressed", async () => {
    renderForm();
    fillRequiredFields("3025000003");
    submit();
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("이름")).toHaveValue("");
    expect(screen.getByLabelText(/음악 검색/)).toHaveValue("");
  });

  it("prompts to overwrite when the student id already has a request", async () => {
    renderForm();
    fillRequiredFields("3025000004");
    submit();
    await screen.findByText("Ditto");
    fireEvent.click(screen.getByRole("button", { name: "변경" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    submit();

    expect(await screen.findByRole("dialog")).toHaveAccessibleName(
      /이미 신청한 곡이 있어요/,
    );
    expect(screen.queryByText("신청이 완료되었어요!")).not.toBeInTheDocument();
  });

  it("overwrites and shows the completion popup on 확인", async () => {
    renderForm();
    fillRequiredFields("3025000005");
    submit();
    await screen.findByText("Ditto");
    fireEvent.click(screen.getByRole("button", { name: "변경" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    submit();
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(await screen.findByText("신청이 완료되었어요!")).toBeInTheDocument();
  });

  it("returns to the form without submitting when overwrite is cancelled", async () => {
    renderForm();
    fillRequiredFields("3025000006");
    submit();
    await screen.findByText("Ditto");
    fireEvent.click(screen.getByRole("button", { name: "변경" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    submit();
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("이름")).toHaveValue("김그루브");
    expect(screen.queryByText("신청이 완료되었어요!")).not.toBeInTheDocument();
  });
});
