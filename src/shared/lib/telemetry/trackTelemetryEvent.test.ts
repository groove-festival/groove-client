import * as Sentry from "@sentry/react";

import { trackTelemetryEvent } from "./trackTelemetryEvent";

vi.mock("@sentry/react", () => ({
  addBreadcrumb: vi.fn(),
  getClient: vi.fn(),
}));

const getClient = vi.mocked(Sentry.getClient);
const addBreadcrumb = vi.mocked(Sentry.addBreadcrumb);

afterEach(() => {
  delete window.clarity;
  delete window.gtag;
  vi.clearAllMocks();
});

describe("trackTelemetryEvent", () => {
  it("sends the event to GA and Clarity without adding identifiers", () => {
    const gtag = vi.fn();
    const clarity = vi.fn();
    window.gtag = gtag;
    window.clarity = clarity;

    trackTelemetryEvent("song_search_success", {
      duration_bucket: "under_1s",
      result_count_bucket: "1_to_5",
    });

    expect(gtag).toHaveBeenCalledWith("event", "song_search_success", {
      duration_bucket: "under_1s",
      result_count_bucket: "1_to_5",
    });
    expect(clarity).toHaveBeenCalledWith("event", "song_search_success");
  });

  it("adds the same safe context as a Sentry breadcrumb after initialization", () => {
    getClient.mockReturnValue({} as ReturnType<typeof Sentry.getClient>);

    trackTelemetryEvent("song_submit_failure", { error_code: "PLST009" });

    expect(addBreadcrumb).toHaveBeenCalledWith({
      category: "product.analytics",
      data: { error_code: "PLST009" },
      level: "info",
      message: "song_submit_failure",
    });
  });

  it("does not retain breadcrumbs when Sentry is disabled", () => {
    getClient.mockReturnValue(undefined);

    trackTelemetryEvent("playlist_form_view");

    expect(addBreadcrumb).not.toHaveBeenCalled();
  });
});
