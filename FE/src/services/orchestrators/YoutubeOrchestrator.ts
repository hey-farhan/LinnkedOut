import { YoutubeAPIService } from "../Platform/youtube/YoutubeAPIService";
import { YoutubeMetadataSevice } from "../Platform/youtube/YoutubeMetadataService";
import { YoutubeTranscriptService } from "../Platform/youtube/YoutubeTranscriptionService";
import { EmbeddingRepository } from "../database/EmbeddingRepository";
import { EmbeddingReturntype, GlobalMetadata, Media, YoutubeMedia} from "../common/types";
import { EmbeddingService } from "../vector/EmbeddingService";
import { categoryDefinitions } from "@/services/common/constants";
import { ProcessingService } from "../vector/PreprocessingService";
import { VectorStore } from "../content/VectorStoreService";
import { YoutubeMediaRepository } from "../database/YoutubeMediaRepository";
import { media } from "@/server/db";

export default class YoutubeOrchestrator {

    private youtubeAPIService:YoutubeAPIService;
    private youtubeMetadataService:YoutubeMetadataSevice;
    private youtubeTranscriptionService:YoutubeTranscriptService; 
    private embeddingService:EmbeddingService;
    private preprocessingService:ProcessingService;
    private vectorStore:VectorStore;
    private embeddingRepository:EmbeddingRepository;
    private youtubeRepository:YoutubeMediaRepository;

    constructor(){
        this.youtubeAPIService = new YoutubeAPIService();
        this.youtubeMetadataService = new YoutubeMetadataSevice();
        this.youtubeTranscriptionService = new YoutubeTranscriptService();
        this.embeddingService = new EmbeddingService(); 
        this.preprocessingService = new ProcessingService();
        this.vectorStore = new VectorStore();
        this.embeddingRepository = new EmbeddingRepository();
        this.youtubeRepository = new YoutubeMediaRepository();
    }

    async mainYoutubeOrchestrator(link:string):Promise<GlobalMetadata> {
        try{
            console.log(`[YoutubeOrchestrator] Starting orchestration for link: ${link}`);
            
            const videoId = this.youtubeAPIService.parseVideoId(link);
            console.log(`[YoutubeOrchestrator] Parsed video ID: ${videoId}`);
            
            const fetchedYoutubeMetadata = await this.youtubeAPIService.fetchVideoMetadata(videoId);
            console.log(`[YoutubeOrchestrator] Fetched video metadata successfully`);

            // Extraction
            const mediaData:Media = this.youtubeMetadataService.extractMediaData(fetchedYoutubeMetadata);
            console.log(`[YoutubeOrchestrator] Extracted media data: ${mediaData.title}`);
            
            const youtubeData = await this.youtubeMetadataService.extractYoutubeData(fetchedYoutubeMetadata);
            console.log(`[YoutubeOrchestrator] Extracted YouTube data`);
            
            youtubeData.englishCaptions = await this.youtubeTranscriptionService.fetchTranscript(videoId, mediaData.title);
            console.log(`[YoutubeOrchestrator] Fetched captions`);
            
            mediaData.tags = await this.youtubeMetadataService.extractTags(fetchedYoutubeMetadata, mediaData, youtubeData);
            console.log(`[YoutubeOrchestrator] Extracted tags`);

            // Embedding
            const { preprocessedContent, contentEmbeddings, assignedCategory } = await this.embeddingOrchestrator(mediaData, youtubeData)
            console.log(`[YoutubeOrchestrator] Generated embeddings, category: ${assignedCategory}`);
            
            //Storing
            console.log(`[YoutubeOrchestrator] Storing embeddings...`);
            mediaData.embeddingId = await this.embeddingRepository.storeContent(preprocessedContent, contentEmbeddings, assignedCategory);
            console.log(`[YoutubeOrchestrator] Embeddings stored with ID: ${mediaData.embeddingId}`);
            
            console.log(`[YoutubeOrchestrator] Saving YouTube media data...`);
            await this.youtubeRepository.saveYoutubeMediaData(mediaData, youtubeData);
            console.log(`[YoutubeOrchestrator] YouTube media data saved successfully, Media ID: ${mediaData.id}, YouTube ID: ${mediaData.youtubeId}`);
            
            const EmbeddingMetadata:EmbeddingReturntype = { embeddingId: mediaData.embeddingId, embeddings: contentEmbeddings}
            
            return({media:mediaData, embeddingsType:EmbeddingMetadata})
        } catch(error){
            console.error(`[YoutubeOrchestrator] Error Orchestrating youtube video:`, error);
            throw error;
        }
    }

    async embeddingOrchestrator(mediaData:Media, youtubeData:YoutubeMedia):Promise<{
        preprocessedContent: string,
        contentEmbeddings: number[],
        assignedCategory: string
    }> {
        try{
            const categoryEmbeddings:Record<string, number[]> = await this.embeddingService.initializeEmbeddings(categoryDefinitions)
            console.log("Categories available for classification:", Object.keys(categoryEmbeddings));
                
            const preprocessedContent: string = this.preprocessingService.extractAndPreprocessData(mediaData, youtubeData);
            const contentEmbeddings: number[] = await this.embeddingService.generateEmbeddings(preprocessedContent);
            if (!categoryDefinitions || Object.keys(categoryDefinitions).length === 0) throw new Error("Category definitions are empty");
            console.log(`Found ${Object.keys(categoryDefinitions).length} category definitions`);

            const assignedCategory = this.vectorStore.classifyEmbedding(contentEmbeddings, categoryEmbeddings);
            mediaData.category = assignedCategory;
            return { preprocessedContent, contentEmbeddings, assignedCategory };
        } catch (error) {
            console.error("YoutubeOrchestrator: Error in storig embeddings:", error);
            throw error;
        } 
    } 

}