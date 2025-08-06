import { NextRequest, NextResponse } from 'next/server';
import { HelperFunctions } from '@/lib/helper_funcs';
import { FormDataType } from '@/app/_components/shared/PostInputForm';

export async function GET(request: NextRequest) {
    try {
        console.log('[/api/test-pipeline] Starting pipeline test...');
        
        const formData: FormDataType = {
            url: ['https://youtu.be/Ko6yct5To40?si=ZTZtJUZGpJ4_Ksu7'],
            category: 'Learning & Skills',
            customTags: ['#test', '#video'],
            fetchSimilar: false, // Set to false to avoid fetching related videos for now
            similarityLevel: 'medium',
            contentType: 'auto'
        };
        
        console.log('[/api/test-pipeline] Form data:', formData);
        console.log('[/api/test-pipeline] Starting PipelineInitializer...');
        
        const result = await HelperFunctions.PipelineInitializer(formData);
        
        console.log('[/api/test-pipeline] Pipeline completed successfully');
        console.log('[/api/test-pipeline] Result length:', result.length);
        console.log('[/api/test-pipeline] Result titles:', result.map(r => r.title));
        
        return NextResponse.json({
            status: 'success',
            message: 'Pipeline test successful',
            result: {
                length: result.length,
                titles: result.map(r => r.title),
                ids: result.map(r => r.id)
            }
        });
    } catch (error: any) {
        console.error('[/api/test-pipeline] Error:', error);
        console.error('[/api/test-pipeline] Error message:', error?.message);
        console.error('[/api/test-pipeline] Error stack:', error?.stack);
        
        return NextResponse.json({
            status: 'error',
            message: 'Pipeline test failed',
            error: error?.message || String(error),
            stack: error?.stack
        }, { status: 500 });
    }
}
