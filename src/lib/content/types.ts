import type { L } from "@/lib/i18n";

export type Sector = "commercial" | "hospitality" | "residential";

export type Project = {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  type: L;
  sector: Sector;
  city: L;
  year: string;
  area: string;
  scope: L[];
  summary: L;
  cover: string;
  gallery: string[];
  featured: boolean;
  inBook: boolean;
  published: boolean;
  order: number;
};

export type TitledText = { title: L; body: L };

export type Value = TitledText & { key: string };

export type Service = TitledText & { key: string; image: string };

export type SectorBlock = { key: Sector; title: L; items: L[]; image: string };

export type TeamMember = {
  id: string;
  name: L;
  role: L;
  bio: L;
  photo: string;
  order: number;
};

export type SiteContent = {
  /** `image` is the studio's own opening frame, shown before the featured projects. */
  hero: { title: L; sub: L; cta: L; image?: string };
  about: { title: L; body: L[]; image: string };
  vision: { title: L; body: L; image: string };
  mission: { title: L; body: L; image: string };
  values: Value[];
  services: Service[];
  sectorsIntro: TitledText;
  sectors: SectorBlock[];
  process: TitledText[];
  statement: L[];
  methodology: TitledText & { image: string; kicker: L };
  execution: TitledText & { image: string; kicker: L };
  quality: TitledText & { image: string; kicker: L; points: L[] };
  teamIntro: TitledText;
};

export type Settings = {
  companyName: L;
  address: L;
  phones: string[];
  email: string;
  whatsapp: string;
  instagram: string;
  linkedin: string;
  mapQuery: string;
  coordinates: string;
};

export type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  message: string;
  locale: string;
  createdAt: number;
  read: boolean;
};

export type SiteData = {
  content: SiteContent;
  projects: Project[];
  team: TeamMember[];
  settings: Settings;
  messages: Message[];
};
