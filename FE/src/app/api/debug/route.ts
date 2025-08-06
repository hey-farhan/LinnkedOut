import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/index';
import { media, youtubeMedia, contentVectors } from '@/server/db/schema';

export async function GET(request: NextRequest) {
    try {
        console.log('[/api/debug] Testing database connection...');
        
        // Test 1: Check if we can query the media table
        console.log('[/api/debug] Querying media table...');
        const mediaCount = await db.select().from(media).limit(1);
        console.log('[/api/debug] Media table query successful, result:', mediaCount);
        
        // Test 2: Check if we can query youtube_media table
        console.log('[/api/debug] Querying youtube_media table...');
        const youtubeCount = await db.select().from(youtubeMedia).limit(1);
        console.log('[/api/debug] YouTube media table query successful, result:', youtubeCount);
        
        // Test 3: Check if we can query embeddings table
        console.log('[/api/debug] Querying media_embeddings table...');
        const embeddingCount = await db.select().from(contentVectors).limit(1);
        console.log('[/api/debug] Embeddings table query successful, result:', embeddingCount);
        
        return NextResponse.json({
            status: 'success',
            message: 'Database connection working',
            tables: {
                media: mediaCount,
                youtubeMedia: youtubeCount,
                embeddings: embeddingCount
            }
        });
    } catch (error: any) {
        console.error('[/api/debug] Database connection error:', error);
        console.error('[/api/debug] Error message:', error?.message);
        console.error('[/api/debug] Error code:', error?.code);
        
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            error: error?.message || String(error),
            code: error?.code
        }, { status: 500 });
    }
}
