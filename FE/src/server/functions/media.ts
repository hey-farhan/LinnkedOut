import { db } from '../db/index'
import { media, redditMedia, youtubeMedia } from '../db/schema'
import { Media, RedditMedia, YoutubeMedia } from '@/services/common/types';
import { count, eq, sql } from 'drizzle-orm';
import { MEDIA_PER_PAGE } from '@/services/common/constants';
import * as schema from "../db/schema"

export const getAllMedia = async (offset: number): Promise<Media[]> => {
    try {
        return await db.select()
            .from(schema.media)
            .orderBy(schema.media.createdAt)
            .limit(MEDIA_PER_PAGE)
            .offset(offset);
    } catch (error: any) {
        console.error('Failed to fetch media:', error);
        throw error;
    }
}

export const getMediaCount = async () => {
    try {
        const [ { mediaCount } ] = await db.select({
            mediaCount: count()
        })
        .from(media);
        return mediaCount;
    } catch(error: any){
        console.error('Failed to fetch count of medias:', error);
        throw error;
    }
}

export const insertMedia = async (generalisedMedia: Media): Promise<{ id: number }> => {
    // // 'use server'
    if (generalisedMedia.durationMs !== undefined && !Number.isInteger(generalisedMedia.durationMs)) {
        throw new Error('durationMs must be an integer');
    }
    try {
        console.log('[insertMedia] Attempting to insert media:', generalisedMedia.title);
        const durationMs = generalisedMedia.durationMs !== undefined
            ? Math.floor(generalisedMedia.durationMs)
            : null;
        const [InsertedMedia] = await db.insert(media)
            .values({
                type: generalisedMedia.type,
                platform: generalisedMedia.platform,
                thumbnailUrl: generalisedMedia.thumbnailUrl,
                postUrl: generalisedMedia.postUrl,
                title: generalisedMedia.title,
                durationMs: durationMs,
                postId: generalisedMedia.postId,
                category: generalisedMedia.category,
                redditId: generalisedMedia.redditId,
                youtubeId: generalisedMedia.youtubeId,
                embeddingId: generalisedMedia.embeddingId,
            })
            .returning({ id: media.id });
        console.log('[insertMedia] Media inserted successfully with ID:', InsertedMedia.id);
        return {id : InsertedMedia.id}
    } catch (error: any) {
        console.error('[insertMedia] Failed to insert media model:', error);
        console.error('[insertMedia] Error message:', error?.message);
        console.error('[insertMedia] Error code:', error?.code);
        console.error('[insertMedia] Full error:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to insert media model: ${error?.message || String(error)}`);
    }
}

export const insertYoutubeMedia = async (ytMedia: YoutubeMedia): Promise<{ id: number }> => {
    // 'use server'
    try {
        console.log('[insertYoutubeMedia] Attempting to insert youtube media');
        const [ReturnedMedia] = await db.insert(youtubeMedia)
            .values([{
                description: ytMedia.description,
                definition: ytMedia.definition,
                englishCaptions: ytMedia.englishCaptions
            }])
            .returning({ id: youtubeMedia.id });
        console.log('[insertYoutubeMedia] YouTube media inserted successfully with ID:', ReturnedMedia.id);
        return {id : ReturnedMedia.id} 
    } catch (error: any) {
        console.error('[insertYoutubeMedia] Failed to insert youtube media model:', error);
        console.error('[insertYoutubeMedia] Error message:', error?.message);
        console.error('[insertYoutubeMedia] Error code:', error?.code);
        throw new Error(`Failed to insert youtube media model: ${error?.message || String(error)}`);
    }
}

export const insertRedditMedia = async (reddit: RedditMedia): Promise<{ id: number }> => {
    // 'use server'
    try {
        const [ReturnedMedia] = await db.insert(redditMedia)
            .values([{
                subreddit: reddit.subreddit,
                author: reddit.author,
                postLink: reddit.postLink,
                comments: reddit.comments
            }])
            .returning({ id: redditMedia.id });
        return {id : ReturnedMedia.id} 
    } catch (error) {
        console.error('Failed to insert reddit media model', error);
        throw new Error('Failed to insert reddit media model');
    }
}

export const getFromMediaById = async (id: number):Promise<Media> => {
    // 'use server'
    try {
        const [fetchedVideo] = await db.select()
            .from(media)
            .where(eq(media.id, id))
            .limit(1)
        return fetchedVideo;
    } catch (error) {
        console.error(`Failed to fetch from media by Id :${id}`, error)
        throw new Error(`Failed to fetch from media`)
    }
}

// Change media id to youtube_id
export const getMediaFromYoutubeById = async (id: number):Promise<YoutubeMedia> => {
    // 'use server'
    try {
        const [fetchedYoutubeMedia] = await db.select()
            .from(youtubeMedia)
            .where(eq(youtubeMedia.id, id))
            .limit(1)
        return fetchedYoutubeMedia 
    } catch (error) {
        console.error(`Failed to fetch media from youtube by Id :${id}`, error)
        throw new Error(`Failed to fetch media from youtube`)
    }
}

// Change media id to reddit_id
export const getMediaFromRedditById = async (id: number):Promise<RedditMedia | null> => {
    // 'use server'
    try {
        const [fetchedRedditMedia]:RedditMedia[] = await db.select()
            .from(redditMedia)
            .where(eq(redditMedia.id, id))
            .limit(1)
            return fetchedRedditMedia ?? null;
    } catch (error) {
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from reddit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


export const getAllMediaWherePlatformYoutube = async(offset: number):Promise<Media[]> => {
    try {
        return await db.select()
            .from(media)
            .where(eq(media.platform,'youtube'))
            .limit(MEDIA_PER_PAGE)
            .offset(offset);
    } catch (error) {
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from Youtube: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getAllMediaWherePlatformReddit = async(offset: number):Promise<Media[]> => {
    // 'use server'
    try {
        return await db.select()
            .from(media)
            .where(eq(media.platform, 'reddit'))
            .limit(MEDIA_PER_PAGE)
            .offset(offset);
    } catch (error) {
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from Reddit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getYoutubeMediaCount = async():Promise<number> => {
    try{
        const [ { ytMediaCount } ] = await db
            .select({ytMediaCount: count() })
            .from(media)
            .where(eq(media.platform, 'youtube'));
        return ytMediaCount;
    } catch(error:any){
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media count of Youtube: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getRedditMediaCount = async():Promise<number> => {
    try{
        const [ { rdtMediaCount } ] = await db
            .select({rdtMediaCount: count() })
            .from(media)
            .where(eq(media.platform, 'reddit'));
        return rdtMediaCount;
    } catch(error:any){
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media count of Reddit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// This is for search suggestion(SearchBar)
export const getMediaFromQuery = async (query: string): Promise<Media[]> => {
    // 'use server'
    try {
        return await db.select()
            .from(media)
            .where(sql`${media.title} ILIKE ${'%' + query + '%'}`)
            .limit(MEDIA_PER_PAGE)
    } catch (error) {
        console.error('Something went wrong while querying database', error)
        throw new Error(`Failed to query database: ${error instanceof Error ? error.message : "Unknown Error Occured"}`)
    }
}

export const insertEmbeddings = async (content: string, contentEmbeddings: number[], category: string): Promise<{ id: number }> => {
    try {
        console.log('[insertEmbeddings] Validating embeddings...');
        if (!contentEmbeddings || !Array.isArray(contentEmbeddings) || contentEmbeddings.length === 0) {
            throw new Error('Content embeddings must be a non-empty array');
        }
        console.log('[insertEmbeddings] Embeddings valid, length:', contentEmbeddings.length);
        
        console.log('[insertEmbeddings] Attempting to insert embeddings for category:', category);
        const insertedRecord = await db
            .insert(schema.contentVectors)
            .values({
                content: content,
                contentEmbedding: contentEmbeddings as any,
                category: category
            })
            .returning({ id: schema.contentVectors.id });
        
        console.log('[insertEmbeddings] Checking returned record...');
        if (!insertedRecord || insertedRecord.length === 0) {
            throw new Error('Failed to insert embedding - no record returned');
        }
        
        console.log('[insertEmbeddings] Embeddings inserted successfully with ID:', insertedRecord[0].id);
        return { id: insertedRecord[0].id };
    } catch (error: any) {
        console.error('[insertEmbeddings] Failed while inserting embeddings:', error);
        console.error('[insertEmbeddings] Error message:', error?.message);
        console.error('[insertEmbeddings] Error code:', error?.code);
        throw new Error(`Failed to insert embeddings in the database: ${error instanceof Error ? error.message : "Unknown Error Occurred"}`);
    }
};

export const getMediaByCategory = async (category:string, offset:number): Promise<Media[]> => {
    try {
        return await db.select()
            .from(media)
            .where(eq(media.category, category))
            .limit(MEDIA_PER_PAGE)
            .offset(offset);
    } catch (error) {
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from given category: ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getCategoryCount = async (category: string): Promise<number> => {
    try{
        const [ { categoryCount } ] = await db
            .select({categoryCount: count() })
            .from(media)
            .where(eq(media.category, category))
            .limit(MEDIA_PER_PAGE)
        return categoryCount;
    } catch(error){
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media count of given category ${category}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// export const getSimilarSearchedFromEmbeddings = async (queryEmbedding: number[], limit: number): Promise<any> => {
//     try {
//         return 1;
//     } catch (error) {
//         console.error('Something went wrong while querying database', error);
//         throw new Error(`Failed to insert embeddings in the database: ${error instanceof Error ? error.message : "Unknown Error Occurred"}`);
//     }
// }

// const { rows } = await this.client.query(`
//     SELECT
//       content,
//       categories,
//       1 - (embedding <=> $1) AS similarity
//     FROM content_vectors
//     ORDER BY similarity DESC
//     LIMIT $2
//   `, [queryEmbedding, limit]);