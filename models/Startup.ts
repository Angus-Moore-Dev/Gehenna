export type Startup = {
    id: string; // uuid
    name: string;
    team: TeamRole[];
    bio: string;
    createdAt: string; // timestamptz
    country: string;
    city: string;
    vision: string;
    avatar: string;
    bannerURL: string;
    primaryColour: string;
    secondaryColour: string;
}


export type TeamRole = {
    userId: string; // foreign key uuid
    type: string; // Founder, Co-Founder, Employee, Advisor, Investor
    description: string; // description of role
    skills: string[]; // array of skills
}