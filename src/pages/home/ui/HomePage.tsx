import { appConfig } from "@/shared/config";

const stack = [
  "React + TypeScript",
  "Tailwind CSS",
  "TanStack Query",
  "React Hook Form",
  "Axios",
  "Playwright",
];

export function HomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#080a0d] px-6 py-10 text-stone-100 sm:px-10">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_left,rgba(217,255,85,0.18),transparent_45%),radial-gradient(circle_at_top_right,rgba(98,126,255,0.15),transparent_40%)]"
      />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-between gap-16">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <p className="text-sm font-semibold tracking-[0.28em] text-lime-300">
            GROOVE
          </p>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-stone-400">
            {appConfig.basePath}
          </span>
        </header>

        <section className="max-w-3xl">
          <p className="mb-5 text-sm font-medium text-lime-300">
            Festival client foundation
          </p>
          <h1
            aria-label="축제의 흐름을 한 화면에 담습니다."
            className="text-5xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-7xl"
          >
            <span className="block">축제의 흐름을</span>
            <span className="block">한 화면에 담습니다.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-pretty text-stone-400 sm:text-lg">
            모바일 우선 GROOVE 서비스를 위한 FSD 기반 프론트엔드 구성이 준비되었습니다.
            제품 기능은 PRD 우선순위에 맞춰 각 slice에 추가합니다.
          </p>
        </section>

        <section aria-labelledby="stack-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 id="stack-heading" className="text-sm font-medium text-stone-300">
              Foundation
            </h2>
            <p className="text-xs text-stone-500">app · pages · shared</p>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((item, index) => (
              <li key={item} className="bg-[#101217] p-5">
                <span className="mb-8 block text-xs text-stone-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-stone-200">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
