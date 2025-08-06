import { HelperFunctions  } from "@/lib/helper_funcs";
import { utility } from "../../common/utils";
import { YOUTUBE_BASE_URL } from "../../common/constants";

export class YoutubeAPIService {
    private apikey:string;

    constructor(){
        if(!process.env.YOUTUBE_API_KEY){
            throw new Error('Youtube API key is missing from environment variables');
        }
        this.apikey = process.env.YOUTUBE_API_KEY;
    }

    // parsing id from url
    public parseVideoId(url:string): string {
        try{
            if (!process.env.YOUTUBE_API_KEY) throw new Error('parseVideoId: Unable to fetch environment keys');
            const videoId:string | null = this.parseYoutubeEmbeddedLink(url);
            if (
                !videoId || 
                typeof videoId !== 'string' || 
                videoId === undefined || 
                videoId === null
            ) {
                throw new Error('The videoid is not valid');
            }
            return videoId;
        } catch(error){
            console.error(`Error parsing youtube link`,error)
            throw error;
        }
    }

    public parseYoutubeEmbeddedLink(link: string): string | null {
        try {
            if(!link) throw new Error('Invalid link')
            const url = new URL(link);
            
            // Handle youtube.com domain links
            if (url.hostname.includes('youtube.com')) {
                if(url.searchParams.has('v')){
                    return url.searchParams.get('v')
                }
                else if(url.pathname.includes('shorts')){
                    const pathParts = url.pathname.split('/');
                    return pathParts.length > 2 ? pathParts[2] : null;
                }
                return null;
            }
            // Handle youtu.be short links
            else if (url.hostname === 'youtu.be') {
                const pathParts = url.pathname.split('/');
                return pathParts.length > 1 ? pathParts[1] : null;
            }

            throw new Error('HelperFuncs: The link format is unrecognizable');
        } catch (error) {
            throw error;
        }
    }

    // fetching metadata using v3 api
    public async fetchVideoMetadata(videoId: string) {
    try {
        const url = `${YOUTUBE_BASE_URL}?id=${videoId}&key=${this.apikey}&part=snippet,contentDetails,statistics,status`;
        const options = { 
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json' 
            },
        }
        const response:any = await utility.apicaller(url, options, 5, 1000);
        if (!response.ok) throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        const data = await response.json();
        if (!data.items || data.items.length === 0) throw new Error('No video data found in the YouTube response');
        
        return data.items[0];
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);
      throw error;
    }
    }

    public async fetchMultipleYtVideosFromQuery(query: string):Promise<any> {
    try {
        // Step 1: Search for videos
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${20}&key=${this.apikey}`;
        const options = { 
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json' 
            },
        }
        const searchResponse:any = await utility.apicaller(searchUrl, options, 5, 1000);
        if (!searchResponse.ok) throw new Error(`YouTube API error: ${searchResponse.status} ${searchResponse.statusText}`);
        const searchData = await searchResponse.json();
        if (!searchData.items || searchData.items.length === 0) throw new Error('No video data found in the YouTube response');
        
        // Step 2: Extract video IDs and fetch full details (including duration)
        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${this.apikey}`;
        
        const detailsResponse:any = await utility.apicaller(detailsUrl, options, 5, 1000);
        if (!detailsResponse.ok) throw new Error(`YouTube API error: ${detailsResponse.status} ${detailsResponse.statusText}`);
        const detailsData = await detailsResponse.json();
        
        return detailsData?.items || [];
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);
      throw error;
    }
    }
}