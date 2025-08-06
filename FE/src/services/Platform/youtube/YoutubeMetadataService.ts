import { Media, YoutubeMedia } from '@/services/common/types'
import { SummaryService } from '@/services/content/summaryService';
import { ProcessingService } from '@/services/vector/PreprocessingService';

export class YoutubeMetadataSevice {

    public extractMediaData = (youtubeMetaData: any): Media => {
        const { id } = youtubeMetaData;
        // Handle both direct video fetch (id is string) and search results (id is object)
        const videoId = typeof id === 'string' ? id : id?.videoId || id?.kind;
        
        const { title, thumbnails, tags } = youtubeMetaData.snippet;
        const { duration } = youtubeMetaData.contentDetails || {};
        const durationMs: number = this.parseDurationToMs(duration)
        const thumbnailUrl = this.getThumbnailUrl(thumbnails);
        const type:'short' | 'image' | 'video' | 'photo' = this.determineVideoType(durationMs)

        return {
            type,
            platform: 'youtube',
            thumbnailUrl,
            postUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title,
            durationMs: durationMs!,
            postId: videoId, 
        }
    };

    public extractTags = async (fetchedYoutubeMetadata: any, mediaData: Media, youtubeData: YoutubeMedia):Promise<string[]> => {
        const tags = fetchedYoutubeMetadata.snippet?.tags;
        if(!tags || tags === undefined) {
            console.warn('Tags are not present for the following media, generating tags...');
            return await this.generateTags(mediaData, youtubeData);
        }
        return tags;
    }

    public generateTags = async (mediaData: Media, youtubeData: YoutubeMedia):Promise<string[]> => {
        const processingService = new ProcessingService();
        const summaryService = new SummaryService();
        const preprocessedDataForTags:string = processingService.extractAndPreprocessData(mediaData, youtubeData);
        return await summaryService.generateTags(preprocessedDataForTags);
    } 

    public extractYoutubeData = async (youtubeMetaData: any): Promise<YoutubeMedia> => {
        const { description } = youtubeMetaData.snippet;
        const { definition } = youtubeMetaData.contentDetails || {};
        return {
            description,
            definition
        };
    };

    public parseDurationToMs = (isoDuration: string): number => {
        if (!isoDuration) return 0;

        let hours = 0, minutes = 0, seconds = 0;

        const hourMatch = isoDuration.match(/(\d+)H/);
        const minuteMatch = isoDuration.match(/(\d+)M/);
        const secondMatch = isoDuration.match(/(\d+)S/);

        if (hourMatch) hours = parseInt(hourMatch[1]);
        if (minuteMatch) minutes = parseInt(minuteMatch[1]);
        if (secondMatch) seconds = parseInt(secondMatch[1]);

        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    };

    public determineVideoType = (durationMs:number): 'short' | 'image' | 'video' | 'photo' => {
        if (durationMs && durationMs < 60000) {
            return 'short';
        }
        return 'video';
    };

    public  getThumbnailUrl = (thumbnails: any): string => {
        const { maxres, standard, high, medium, default: defaultThumbnail } = thumbnails;
        if (maxres) {
            return maxres.url;
        } else if (standard) {
            return standard.url;
        } else if (high) {
            return high.url;
        } else if (medium) {
            return medium.url;
        } else if (defaultThumbnail) {
            return defaultThumbnail.url;
        }
        return '';
    }

}