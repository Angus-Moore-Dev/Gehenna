export type Post = {
    id: string;
    articleId: string; // My bad
    title: string;
    content: string;
    userId: string;
    createdAt: string;
    tags: string[];
    attachedFileURLs: AttachedFile[];
    postImageURL: AttachedFile;
    startupId: string | null; // The id of the startup that this post COULD be associated with
}

export type AttachedFile = {
    url: string;
    mimeType: string; // image/jpeg, video/mp4, audio/ogg etc.
    byteSize: number;
};

// Generate an enum called Tags, where it provides an exhaustive list of topics that a user can post about.
// This is useful for the frontend, where we can provide a dropdown list of topics for the user to choose from.
export enum Tags
{
    'General' = 'General',
    'Technology' = 'Technology',
    'Science' = 'Science',
    'Politics' = 'Politics',
    'Sports' = 'Sports',
    'Entertainment' = 'Entertainment',
    'Food' = 'Food',
    'Travel' = 'Travel',
    'Fashion' = 'Fashion',
    'Health' = 'Health',
    'Fitness' = 'Fitness',
    'Education' = 'Education',
    'Business' = 'Business',
    'Finance' = 'Finance',
    'Art' = 'Art',
    'Music' = 'Music',
    'Gaming' = 'Gaming',
    'Books' = 'Books',
    'Movies' = 'Movies',
    'TV' = 'TV',
    'Anime' = 'Anime',
    'Manga' = 'Manga',
    'Comics' = 'Comics',
    'Programming' = 'Programming',
    'Web Development' = 'Web Development',
    'Mobile Development' = 'Mobile Development',
    'Game Development' = 'Game Development',
    'Software Development' = 'Software Development',
    'Machine Learning' = 'Machine Learning',
    'Artificial Intelligence' = 'Artificial Intelligence',
    'Data Science' = 'Data Science',
    'Cybersecurity' = 'Cybersecurity',
    'Cloud Computing' = 'Cloud Computing',
    'DevOps' = 'DevOps',
    'Blockchain' = 'Blockchain',
    'Cryptocurrency' = 'Cryptocurrency',
    'Virtual Reality' = 'Virtual Reality',
    'Augmented Reality' = 'Augmented Reality',
    'Mixed Reality' = 'Mixed Reality',
    'Internet of Things' = 'Internet of Things',
    'Robotics' = 'Robotics',
    'Drones' = 'Drones',
    'Space' = 'Space',
    'Astronomy' = 'Astronomy',
    'Physics' = 'Physics',
    'Chemistry' = 'Chemistry',
    'Biology' = 'Biology',
    'Mathematics' = 'Mathematics',
    'Medicine' = 'Medicine',
    'Psychology' = 'Psychology',
    'Philosophy' = 'Philosophy',
    'History' = 'History',
    'Geography' = 'Geography',
    'Economics' = 'Economics',
    'Sociology' = 'Sociology',
    'Law' = 'Law',
    'Religion' = 'Religion',
    'Languages' = 'Languages',
    'Writing' = 'Writing',
    'Poetry' = 'Poetry',
    'Comedy' = 'Comedy',
    'Photography' = 'Photography',
    'Design' = 'Design',
    'Drawing' = 'Drawing',
    'Painting' = 'Painting',
    'Sculpture' = 'Sculpture',
    'Animation' = 'Animation',
    'Startups' = 'Startups',
    'Entrepreneurship' = 'Entrepreneurship',
    'Marketing' = 'Marketing',
    'Advertising' = 'Advertising',
    'Business Development' = 'Business Development',
}