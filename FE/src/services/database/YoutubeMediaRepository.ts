import { Media, YoutubeMedia } from '@/services/common/types';
import { insertMedia, insertYoutubeMedia } from '@/server/functions/media';

export class YoutubeMediaRepository {

  public async saveYoutubeMediaData(mediaData: Media, youtubeData: YoutubeMedia): Promise<void> {
    try {
      console.log(`[YoutubeMediaRepository] Starting to save YouTube media data for: ${mediaData.title}`);
      
      const { id: youtubeId } = await this.insert_YoutubeMedia(youtubeData);
      console.log(`[YoutubeMediaRepository] YouTube media inserted with ID: ${youtubeId}`);
      
      if (youtubeId === undefined || youtubeId === null || isNaN(youtubeId) || youtubeId <= 0) {
        throw new Error('Error saving metadata to the database - invalid youtubeId');
      }
      
      mediaData.youtubeId = youtubeId;

      const { id: mediaId } = await this.insert_Media(mediaData);
      console.log(`[YoutubeMediaRepository] Media inserted with ID: ${mediaId}`);
      
      if (mediaId === undefined || mediaId === null || isNaN(mediaId) || mediaId <= 0) {
        throw new Error('Error saving metadata to the database - invalid mediaId');
      }
      
      mediaData.id = mediaId;
      console.log(`[YoutubeMediaRepository] Successfully saved all YouTube media data`);
    } catch (error) {
      console.error('[YoutubeMediaRepository] Error saving media data to database:', error);
      throw error;
    }
  }

  private async insert_YoutubeMedia(youtubeData: YoutubeMedia): Promise<{ id: number }> {
    try {
      return await insertYoutubeMedia(youtubeData);
    } catch (error) {
      console.error('Error inserting YouTube media data:', error);
      throw error;
    }
  }

  private async insert_Media(mediaData: Media): Promise<{ id: number }> {
    try {
      return await insertMedia(mediaData);
    } catch (error) {
      console.error('Error inserting media data:', error);
      throw error;
    }
  }
}