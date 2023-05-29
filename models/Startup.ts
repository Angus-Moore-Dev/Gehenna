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
    type: string;
    description: string;
    skills: string[];
}