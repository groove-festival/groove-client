const GIS_SRC = "https://accounts.google.com/gsi/client";

afterEach(() => {
  document.head.innerHTML = "";
  delete window.google;
  vi.resetModules();
});

describe("loadGoogleIdentityScript", () => {
  it("injects the GIS script once and resolves when it loads", async () => {
    const { loadGoogleIdentityScript } = await import("./googleIdentity");

    const promise = loadGoogleIdentityScript();
    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`,
    );
    expect(script).not.toBeNull();

    script?.dispatchEvent(new Event("load"));
    await expect(promise).resolves.toBeUndefined();
  });

  it("resolves immediately when google.accounts.id is already present", async () => {
    window.google = { accounts: { id: {} as never } };
    const { loadGoogleIdentityScript } = await import("./googleIdentity");

    await expect(loadGoogleIdentityScript()).resolves.toBeUndefined();
    expect(document.querySelector("script")).toBeNull();
  });

  it("reuses the same script element across concurrent calls", async () => {
    const { loadGoogleIdentityScript } = await import("./googleIdentity");

    const first = loadGoogleIdentityScript();
    const second = loadGoogleIdentityScript();
    const scripts = document.querySelectorAll(`script[src="${GIS_SRC}"]`);
    expect(scripts).toHaveLength(1);

    scripts[0].dispatchEvent(new Event("load"));
    await Promise.all([first, second]);
  });

  it("rejects when the script fails to load", async () => {
    const { loadGoogleIdentityScript } = await import("./googleIdentity");

    const promise = loadGoogleIdentityScript();
    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`,
    );
    script?.dispatchEvent(new Event("error"));

    await expect(promise).rejects.toThrowError("GIS script failed to load");
  });
});
