import { NextRequest, NextResponse } from 'next/server';
import YoutubeOrchestrator from '@/services/orchestrators/YoutubeOrchestrator';

export async function GET(request: NextRequest) {
    try {
        console.log('[/api/test-orchestrator] Starting YouTube orchestrator test...');
        
        // Use a real YouTube video link (short video)
        const testLink = 'https://youtu.be/Ko6yct5To40?si=ZTZtJUZGpJ4_Ksu7';
        console.log('[/api/test-orchestrator] Testing with link:', testLink);
        
        const youtubeOrchestrator = new YoutubeOrchestrator();
        const result = await youtubeOrchestrator.mainYoutubeOrchestrator(testLink);
        
        console.log('[/api/test-orchestrator] Orchestrator completed successfully');
        console.log('[/api/test-orchestrator] Result:', {
            mediaTitle: result.media.title,
            mediaId: result.media.id,
            youtubeId: result.media.youtubeId,
            embeddingId: result.media.embeddingId,
            embeddingsLength: result.embeddingsType.embeddings.length
        });
        
        return NextResponse.json({
            status: 'success',
            message: 'Orchestrator test successful',
            result: {
                mediaTitle: result.media.title,
                mediaId: result.media.id,
                youtubeId: result.media.youtubeId,
                embeddingId: result.media.embeddingId,
                embeddingsLength: result.embeddingsType.embeddings.length
            }
        });
    } catch (error: any) {
        console.error('[/api/test-orchestrator] Error:', error);
        console.error('[/api/test-orchestrator] Error message:', error?.message);
        console.error('[/api/test-orchestrator] Error stack:', error?.stack);
        
        return NextResponse.json({
            status: 'error',
            message: 'Orchestrator test failed',
            error: error?.message || String(error),
            stack: error?.stack
        }, { status: 500 });
    }
}
