import githubIcon from "../festival-visuals/github.png";
import instagramIcon from "../festival-visuals/instagram.png";
import { creditSections, type TeamMember } from "../model/teamMembers";

const buildInstagramUrl = (handle: string): string =>
  `https://instagram.com/${handle.replace(/^@/, "")}`;

const buildGithubUrl = (handle: string): string =>
  `https://github.com/${handle.replace(/^@/, "")}`;

interface SnsPillProps {
  icon: string;
  handle: string | null;
  href: string | null;
}

const SnsPill = ({ icon, handle, href }: SnsPillProps) => {
  const content = (
    <>
      <img alt="" className="size-4 shrink-0" src={icon} />
      <span className="truncate text-[13px] font-medium text-[#c7c7c7]">
        {handle ?? "아이디"}
      </span>
    </>
  );

  return (
    <div className="flex h-9 items-center rounded-full bg-[#2a2a2a] px-3">
      {href ? (
        <a
          className="flex min-w-0 items-center gap-2"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          {content}
        </a>
      ) : (
        <span className="flex min-w-0 items-center gap-2">{content}</span>
      )}
    </div>
  );
};

interface MemberCardProps {
  member: TeamMember;
}

const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <article className="flex flex-col items-center rounded-2xl border border-[#3a3a3a] bg-[#232323] px-3 pt-7 pb-8">
      <div className="size-16 overflow-hidden rounded-full bg-[#d9d9d9]">
        {member.profileImage ? (
          <img
            alt=""
            className="size-full object-cover"
            height={64}
            src={member.profileImage}
            srcSet={member.profileImageSrcSet}
            width={64}
          />
        ) : null}
      </div>
      <p className="mt-5 text-lg font-bold text-white">{member.name}</p>
      <p className="mt-1 text-center text-[13px] leading-4 font-medium text-[#c7c7c7]">
        {member.affiliation ?? "학과/학번"}
      </p>

      <div className="mt-4 flex w-full flex-col gap-2">
        {member.instagram !== undefined ? (
          <SnsPill
            handle={member.instagram}
            href={member.instagram ? buildInstagramUrl(member.instagram) : null}
            icon={instagramIcon}
          />
        ) : null}
        {member.github !== undefined ? (
          <SnsPill
            handle={member.github}
            href={member.github ? buildGithubUrl(member.github) : null}
            icon={githubIcon}
          />
        ) : null}
      </div>
    </article>
  );
};

export default function CreditsPage() {
  return (
    <main className="flex flex-1 flex-col overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
      <div className="w-full bg-[#1c1c1c] px-4 pt-[100px] pb-16">
        <div className="flex h-8 items-center justify-center">
          <h1 className="text-[26px] font-extrabold tracking-wide">CREDITS</h1>
        </div>

        <div className="mt-14 flex flex-col gap-12">
          {creditSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-extrabold text-[#fcfcfc]">
                {section.title}
              </h2>
              <div className="mt-6 grid grid-cols-2 items-start gap-x-4 gap-y-4">
                {section.members.map((member, index) => (
                  <MemberCard key={`${member.name}-${index}`} member={member} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
