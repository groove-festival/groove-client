import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import GroovePlaylistPage from "./GroovePlaylistPage";

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/playlist"]}>
        <Routes>
          <Route path="/" element={<p>home route</p>} />
          <Route path="/playlist" element={<GroovePlaylistPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("GroovePlaylistPage", () => {
  it("shows the header and the PLAYLIST heading", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "GROOVE PLAYLIST" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "PLAYLIST" })).toBeInTheDocument();
  });

  it("renders the fetched playlist entries", async () => {
    renderPage();

    expect(await screen.findByText("Ditto")).toBeInTheDocument();
    expect(screen.getByText("IT • 밤샘코딩")).toBeInTheDocument();
  });

  it("goes to the home route from the back button", async () => {
    renderPage();
    await screen.findByText("Ditto");

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(screen.getByText("home route")).toBeInTheDocument();
  });
});
