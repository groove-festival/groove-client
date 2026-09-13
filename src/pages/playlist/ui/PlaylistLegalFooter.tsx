import { playlistFooterLinks } from "../model/legalLinks";

export const PlaylistLegalFooter = () => {
  return (
    <footer className="font-pretendard absolute right-4 bottom-8 left-4 flex flex-col items-center gap-4 text-center">
      <p className="text-[10px] leading-3 text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>

      <nav
        aria-label="정책 링크"
        className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] leading-4 font-semibold text-[#fcfcfc]"
      >
        {playlistFooterLinks.map((link) => (
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
    </footer>
  );
};
