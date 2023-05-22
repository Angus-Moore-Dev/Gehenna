export type Notification = {
    id: number;
    created_at: string;
    title: string;
    text: string;
    link: string;
    userId: string; // you!
    seen: boolean; // false in the db if left empty.
}