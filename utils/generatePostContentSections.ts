import { ContentSection, NewPostContent } from "./global.types";


export default function generatePostContentSections(postStructure: NewPostContent[]): ContentSection[]
{
    const contentSections: ContentSection[] = [];

    for (const section of postStructure)
    {
        const contentSection: ContentSection = {
            mimeType: section.mimeType,
            content: process.env.NODE_ENV === 'development' ? section.type !== 'text' ? section.mediaTempURL : section.content as string : section.content as string,
            byteSize: section.byteSize,
            contentType: section.type
        };

        contentSections.push(contentSection);
    }

    return contentSections;
}