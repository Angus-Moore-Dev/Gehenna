import { Profile } from "@/models/Profile";
import { User } from "@supabase/supabase-js";

interface NewPostSection
{
    user: User;
    profile: Profile;
}

/**
 * A section that allows the user to create a new post.
 */
export default function NewPostSection({ user, profile }: NewPostSection)
{

}