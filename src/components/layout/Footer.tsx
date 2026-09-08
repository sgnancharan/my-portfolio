import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { profile, socials } from "@/data/profile";

const icons = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
};

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#05070c]/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate-400">
            {profile.displayName}
          </p>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            {profile.study} · {profile.campus}
          </p>
        </div>
        <ul className="flex items-center gap-3">
          {socials.map((social) => {
            const Icon = icons[social.id];
            return (
              <li key={social.id}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-200 transition-colors hover:border-cyan-200/40 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                >
                  <Icon width={16} height={16} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="border-t border-white/5 px-5 py-4 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
        No fabricated credentials · Local stack only
      </p>
    </footer>
  );
}
