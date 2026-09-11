import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { AdminLoginForm } from "./AdminLoginForm";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

const renderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminLoginForm account={undefined} />, { wrapper });
};

const fillAndSubmit = () => {
  fireEvent.change(screen.getByLabelText("아이디"), { target: { value: "admin" } });
  fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "pw" } });
  fireEvent.click(screen.getByRole("button", { name: "로그인" }));
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("AdminLoginForm", () => {
  it("blocks submission and shows a field message when empty", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByText("아이디를 입력해 주세요.")).toBeInTheDocument();
    expect(httpPost).not.toHaveBeenCalled();
  });

  it("shows a credentials message on A002", async () => {
    const axiosError = new AxiosError("unauthorized", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "A002", message: "불일치" } },
      status: 401,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPost.mockRejectedValueOnce(axiosError);
    renderForm();

    fillAndSubmit();

    expect(
      await screen.findByText("아이디 또는 비밀번호가 올바르지 않아요."),
    ).toBeInTheDocument();
  });

  it("rejects a non-promo admin after a successful login", async () => {
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: { role: "PUB_ADMIN", pubId: 3 }, error: null },
      status: 200,
    });
    renderForm();

    fillAndSubmit();

    expect(
      await screen.findByText(/홍보팀 관리자 계정이 아니에요/),
    ).toBeInTheDocument();
  });

  it("shows the wrong-account notice when already logged in as another role", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminLoginForm
          account={{
            loggedIn: true,
            role: "STAGE_ADMIN",
            displayName: null,
            pubId: null,
          }}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/홍보팀 관리자 계정이 아니에요/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
  });
});
