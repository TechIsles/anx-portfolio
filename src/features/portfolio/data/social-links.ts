import type { SocialProfile } from "@/features/portfolio/types/social-links"

/**
 * Keyed registry of social profiles — the single source of truth. Icons are
 * bound separately in `social-link-icons.tsx` (keyed by the same `SocialName`),
 * so adding a profile here forces the icon map to stay in sync at compile time.
 *
 * Profiles without an account yet stay commented out — uncomment both here and
 * in `social-link-icons.tsx` together, and add the icon to `@/components/icons`
 * if it is not there already.
 */
export const SOCIAL = {
  // x: {
  //   title: "X",
  //   handle: "@AnxForever",
  //   href: "https://x.com/AnxForever",
  //   sameAs: true,
  // },
  github: {
    title: "GitHub",
    handle: "AnxForever",
    href: "https://github.com/AnxForever",
    sameAs: true,
  },
  huggingface: {
    title: "Hugging Face",
    handle: "AnxForever",
    href: "https://huggingface.co/AnxForever",
    sameAs: true,
  },
  xiaohongshu: {
    title: "小红书",
    handle: "AnxForever",
    href: "https://www.xiaohongshu.com/user/profile/644c7bfb0000000010024171",
    sameAs: true,
  },
  // linkedin: {
  //   title: "LinkedIn",
  //   handle: "AnxForever",
  //   href: "https://linkedin.com/in/AnxForever",
  //   sameAs: true,
  // },
  // discord: {
  //   title: "Discord",
  //   handle: "AnxForever",
  //   href: "https://discord.com/users/000000000000000000",
  // },
  // youtube: {
  //   title: "YouTube",
  //   handle: "@AnxForever",
  //   href: "https://www.youtube.com/@AnxForever",
  //   sameAs: true,
  // },
} satisfies Record<string, SocialProfile>

export type SocialName = keyof typeof SOCIAL

export type SocialLink = SocialProfile & { name: SocialName }

export const SOCIAL_LINKS: SocialLink[] = (
  Object.entries(SOCIAL) as [SocialName, SocialProfile][]
).map(([name, profile]) => ({ name, ...profile }))
