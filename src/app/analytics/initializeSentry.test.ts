import * as Sentry from "@sentry/react";

import { appConfig } from "@/shared/config";

import { initializeSentry } from "./initializeSentry";

vi.mock("@sentry/react", () => ({ init: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("initializeSentry", () => {
  it("removes private request details from error and breadcrumb callbacks", async () => {
    initializeSentry("https://public@example.invalid/1");

    const options = vi.mocked(Sentry.init).mock.calls[0]?.[0];
    expect(options?.sendDefaultPii).toBe(false);
    expect(options?.beforeSend).toBeDefined();
    expect(options?.beforeBreadcrumb).toBeDefined();

    const privateUrl = "https://example.invalid/groove/admin?student=example";
    const safeUrl = `${window.location.origin}${appConfig.basePath}`;
    const event = await options?.beforeSend?.(
      {
        type: undefined,
        user: { id: "example" },
        request: {
          url: privateUrl,
          headers: { Authorization: "example" },
          query_string: "student=example",
          cookies: { session: "example" },
        },
      },
      {},
    );
    const breadcrumb = options?.beforeBreadcrumb?.({ data: { url: privateUrl } }, {});

    expect(event?.user).toBeUndefined();
    expect(event?.request).toMatchObject({
      url: safeUrl,
      headers: undefined,
      query_string: undefined,
      cookies: undefined,
    });
    expect(breadcrumb?.data?.url).toBe(safeUrl);
  });
});
