import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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
});
