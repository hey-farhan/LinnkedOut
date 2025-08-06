import { NextRequest, NextResponse } from 'next/server';
import { insertYoutubeMedia, insertMedia, insertEmbeddings } from '@/server/functions/media';
import { Media, YoutubeMedia } from '@/services/common/types';

export async function GET(request: NextRequest) {
    try {
        console.log('[/api/test-insert] Starting insertion test...');
        
        // Test inserting YouTube media
        console.log('[/api/test-insert] Test 1: Inserting YouTube media...');
        const youtubeData: YoutubeMedia = {
            description: 'Test video description',
            definition: '1080p',
            englishCaptions: [] as any
        };
        
        const { id: youtubeId } = await insertYoutubeMedia(youtubeData);
        console.log('[/api/test-insert] YouTube media inserted with ID:', youtubeId);
        
        // Test inserting embeddings
        console.log('[/api/test-insert] Test 2: Inserting embeddings...');
        const testEmbeddings = Array(1024).fill(0.1); // Mock embedding vector
        const { id: embeddingId } = await insertEmbeddings(
            'Test preprocessed content',
            testEmbeddings,
            'Learning & Skills'
        );
        console.log('[/api/test-insert] Embeddings inserted with ID:', embeddingId);
        
        // Test inserting media
        console.log('[/api/test-insert] Test 3: Inserting media...');
        const mediaData: Media = {
            type: 'video' as any,
            platform: 'youtube',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            postUrl: 'https://youtube.com/watch?v=test',
            title: 'Test Video Title',
            durationMs: 600000,
            postId: 'test123',
            category: 'Learning & Skills',
            youtubeId: youtubeId,
            embeddingId: embeddingId,
            tags: ['test', 'video']
        };
        
        const { id: mediaId } = await insertMedia(mediaData);
        console.log('[/api/test-insert] Media inserted with ID:', mediaId);
        
        return NextResponse.json({
            status: 'success',
            message: 'All insertions successful',
            ids: {
                youtubeId,
                embeddingId,
                mediaId
            }
        });
    } catch (error: any) {
        console.error('[/api/test-insert] Error:', error);
        console.error('[/api/test-insert] Error message:', error?.message);
        console.error('[/api/test-insert] Error code:', error?.code);
        console.error('[/api/test-insert] Full error:', JSON.stringify(error, null, 2));
        
        return NextResponse.json({
            status: 'error',
            message: 'Insertion failed',
            error: error?.message || String(error),
            code: error?.code
        }, { status: 500 });
    }
}
