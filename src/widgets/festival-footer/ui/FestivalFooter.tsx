import { festivalFooterLinks } from "@/shared/config";

export const FestivalFooter = () => (
  <footer className="font-pretendard w-full bg-[#1c1c1c] px-4 pt-8 pb-8 text-center text-[#fcfcfc]">
    <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-4">
      <p className="text-[10px] leading-3 text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>
      <nav
        aria-label="정책 링크"
        className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] leading-4 font-semibold"
      >
        {festivalFooterLinks.map((link) => (
          <a
            className="underline underline-offset-2"
            href={link.href}
            key={link.href}
            rel="noreferrer"
            target="_blank"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  </footer>
);
