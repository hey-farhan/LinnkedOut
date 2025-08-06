import { categoryDefinitions } from "../common/constants";
import { EmbeddingReturntype, GlobalMetadata, Media, RedditMedia } from "../common/types";
import { VectorStore } from "../content/VectorStoreService";
import { EmbeddingRepository } from "../database/EmbeddingRepository";
import { RedditMediaRepository } from "../database/RedditMediaRepository";
import { RedditAPIService } from "@/services/Platform/reddit/RedditAPIService";
import { RedditMetadataSevice } from "../Platform/reddit/RedditMetadataService";
import { EmbeddingService } from "../vector/EmbeddingService";
import { ProcessingService } from "../vector/PreprocessingService";

export default class RedditOrchestrator {

    private redditAPIService: RedditAPIService;
    private redditMetadataService: RedditMetadataSevice;
    private embeddingService: EmbeddingService;
    private preprocessingService: ProcessingService;
    private vectorStore: VectorStore;
    private embeddingRepository: EmbeddingRepository;
    private redditRepository: RedditMediaRepository;

    constructor() {
        this.redditAPIService = new RedditAPIService();
        this.redditMetadataService = new RedditMetadataSevice();
        this.embeddingService = new EmbeddingService();
        this.preprocessingService = new ProcessingService();
        this.vectorStore = new VectorStore();
        this.embeddingRepository = new EmbeddingRepository();
        this.redditRepository = new RedditMediaRepository();
    }

    async mainRedditOrchestrator(link: string):Promise<GlobalMetadata> {
        try {
            const redditId = this.redditAPIService.parseRedditUrlForId(link);
            const subreddit = this.redditAPIService.parseRedditUrlForSubreddit(link);
            const fetchedRedditMetaData = await this.redditAPIService.fetchVideoMetadata(subreddit, redditId);
            const mediaData: Media = await this.redditMetadataService.extractMediaData(fetchedRedditMetaData);
            const redditData: RedditMedia = await this.redditMetadataService.extractRedditData(fetchedRedditMetaData);
            redditData.comments = await this.redditMetadataService.extractTopComments(fetchedRedditMetaData);

            const EmbeddingMetadata: EmbeddingReturntype = await this.embeddingStorageOrchestrator(mediaData, redditData)
            mediaData.embeddingId = EmbeddingMetadata.embeddingId;
            await this.redditRepository.saveRedditPostToDatabase(mediaData, redditData);
            return({media:mediaData, embeddingsType:EmbeddingMetadata})

            // return { videoMetadataId: metaDataId, embeddingsId: embeddingsId }
        } catch (error) {
            console.error('Error in fetching Reddit post:', error);
            throw error;
        }
    }

    private async embeddingStorageOrchestrator(mediaData: Media, redditData: RedditMedia): Promise<EmbeddingReturntype> {
        try {
            const categoryEmbeddings: Record<string, number[]> = await this.embeddingService.initializeEmbeddings(categoryDefinitions)
            console.log("Categories available for classification:", Object.keys(categoryEmbeddings));

            const preprocessedContent: string = this.preprocessingService.extractAndPreprocessData(mediaData, redditData);
            const contentEmbeddings: number[] = await this.embeddingService.generateEmbeddings(preprocessedContent);
            if (!categoryDefinitions || Object.keys(categoryDefinitions).length === 0) throw new Error("Category definitions are empty");
            console.log(`Found ${Object.keys(categoryDefinitions).length} category definitions`);

            const assignedCategory = this.vectorStore.classifyEmbedding(contentEmbeddings, categoryEmbeddings);
            mediaData.category = assignedCategory;
            const embeddingIdInDatabase: number = await this.embeddingRepository.storeContent(preprocessedContent, contentEmbeddings, assignedCategory);
            return {embeddingId:embeddingIdInDatabase, embeddings: contentEmbeddings};
        } catch (error) {
            console.error("RedditOrchestrator: Error in storig embeddings:", error);
            throw error;
        }
    }
} 