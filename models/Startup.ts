export type Startup = {
    id: string; // uuid
    name: string;
    bio: string;
    createdAt?: string; // timestamptz
    country: string;
    mission: string;
    domain: string;
    industry: string;
    avatar: string;
    bannerURL: string;
    team: TeamRole[];
    theme: "Light" | "Dark";
}


export type TeamRole = {
    avatar: string;
    name: string;
    email: string;
    role: string;
}