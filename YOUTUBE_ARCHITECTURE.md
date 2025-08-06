# YouTube Content Processing Architecture

## 🎯 System Overview

A Next.js full-stack application that fetches YouTube videos, processes their content using AI embeddings, automatically categorizes them, and provides a searchable interface.

---

## 🏗️ Complete System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ CLIENT LAYER"]
        UI[Next.js Frontend]
        Pages[React Pages]
        Components[UI Components]
    end

    subgraph API["🔌 API LAYER"]
        Videos["/api/videos<br/>GET - List Videos"]
        VideoID["/api/videos/[id]<br/>GET - Single Video"]
        Query["/api/videos/query<br/>GET - Search"]
        Category["/api/videos/category<br/>GET - Filter by Category"]
        Summarize["/api/summarize<br/>POST - AI Summary"]
        TestOrch["/api/test-orchestrator<br/>GET - Test Pipeline"]
    end

    subgraph Orchestration["🎯 ORCHESTRATION LAYER"]
        YTO[YouTube Orchestrator]
        
        subgraph Pipeline["Processing Pipeline"]
            Step1[1. Extract Metadata]
            Step2[2. Fetch Captions]
            Step3[3. Generate Embeddings]
            Step4[4. Classify Category]
            Step5[5. Store Data]
        end
    end

    subgraph Services["⚙️ SERVICE LAYER"]
        subgraph Platform["YouTube Services"]
            YTS[YouTube API Service]
            YTM[YouTube Metadata Service]
            YTT[YouTube Transcript Service]
        end
        
        subgraph Vector["AI/ML Services"]
            EmbedGen[Embedding Service]
            Preproc[Preprocessing Service]
            Cache[Cache Service]
        end
        
        subgraph Content["Content Services"]
            VectorStore[Vector Store Service]
            Summary[Summary Service]
        end
    end

    subgraph Repository["💾 DATA ACCESS LAYER"]
        YTRepo[YouTube Media Repository]
        EmbedRepo[Embedding Repository]
    end

    subgraph Database["🗄️ DATABASE"]
        subgraph PostgreSQL["PostgreSQL + pgvector"]
            MediaTable[(media)]
            YTTable[(youtube_media)]
            EmbedTable[(media_embeddings)]
        end
    end

    subgraph External["🌐 EXTERNAL APIs"]
        YouTubeAPI[YouTube Data API v3]
        VoyageAPI[Voyage AI]
        GeminiAPI[Google Gemini]
    end

    %% Connections
    UI --> Videos
    UI --> VideoID
    UI --> Query
    UI --> Category
    UI --> Summarize
    
    Videos --> YTO
    TestOrch --> YTO
    Summarize --> Summary
    
    YTO --> YTS
    YTO --> YTM
    YTO --> YTT
    YTO --> EmbedGen
    YTO --> Preproc
    YTO --> VectorStore
    YTO --> YTRepo
    YTO --> EmbedRepo
    
    YTS --> YouTubeAPI
    EmbedGen --> VoyageAPI
    Summary --> GeminiAPI
    
    YTRepo --> MediaTable
    YTRepo --> YTTable
    EmbedRepo --> EmbedTable
    
    %% Styling
    classDef clientStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef apiStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef orchStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef serviceStyle fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef repoStyle fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef dbStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef externalStyle fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    
    class UI,Pages,Components clientStyle
    class Videos,VideoID,Query,Category,Summarize,TestOrch apiStyle
    class YTO,Step1,Step2,Step3,Step4,Step5 orchStyle
    class YTS,YTM,YTT,EmbedGen,Preproc,Cache,VectorStore,Summary serviceStyle
    class YTRepo,EmbedRepo repoStyle
    class MediaTable,YTTable,EmbedTable dbStyle
    class YouTubeAPI,VoyageAPI,GeminiAPI externalStyle
```

---

## 📊 Database Schema

```mermaid
erDiagram
    media ||--|| youtube_media : "has"
    media ||--|| media_embeddings : "has"
    
    media {
        int id PK
        enum type "short|video"
        varchar platform "youtube"
        varchar thumbnail_url
        varchar post_url
        text title
        int duration_ms
        varchar post_id
        text category
        timestamp created_at
        timestamp updated_at
        int youtube_id FK
        int embedding_id FK
    }
    
    youtube_media {
        int id PK
        text description
        varchar definition
        jsonb english_captions
    }
    
    media_embeddings {
        int id PK
        text content
        vector embedding "1024 dimensions"
    }
```

---

## 🔄 Complete Data Flow

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant API as API Route
    participant YTO as YouTube Orchestrator
    participant YTS as YouTube API Service
    participant YTM as Metadata Service
    participant YTT as Transcript Service
    participant YTA as YouTube API
    participant Prep as Preprocessing Service
    participant Embed as Embedding Service
    participant Voyage as Voyage AI
    participant Vector as Vector Store
    participant Repo as Repository
    participant DB as PostgreSQL

    User->>API: POST /api/test-orchestrator
    Note over API: User submits YouTube link
    
    API->>YTO: mainYoutubeOrchestrator(link)
    
    rect rgb(230, 230, 250)
    Note over YTO,YTA: PHASE 1: EXTRACTION
    YTO->>YTS: parseVideoId(link)
    YTS-->>YTO: videoId
    
    YTO->>YTS: fetchVideoMetadata(videoId)
    YTS->>YTA: GET /videos?id={videoId}
    YTA-->>YTS: Raw metadata JSON
    YTS-->>YTO: Parsed metadata
    
    YTO->>YTM: extractMediaData(metadata)
    YTM-->>YTO: Media object
    
    YTO->>YTM: extractYoutubeData(metadata)
    YTM-->>YTO: YouTube-specific data
    
    YTO->>YTT: fetchTranscript(videoId)
    YTT->>YTA: GET captions
    YTA-->>YTT: Caption data
    YTT-->>YTO: English captions array
    
    YTO->>YTM: extractTags(metadata)
    YTM-->>YTO: Tags array
    end
    
    rect rgb(240, 255, 240)
    Note over YTO,Voyage: PHASE 2: AI PROCESSING
    YTO->>Prep: extractAndPreprocessData(media, youtube)
    Prep-->>YTO: Cleaned text
    
    YTO->>Embed: generateEmbeddings(text)
    Embed->>Voyage: embedQuery(text)
    Voyage-->>Embed: Vector[1024]
    Embed-->>YTO: Content embeddings
    
    YTO->>Embed: initializeEmbeddings(categories)
    Note over Embed: Check cache first
    Embed-->>YTO: Category embeddings
    
    YTO->>Vector: classifyEmbedding(content, categories)
    Note over Vector: Calculate cosine similarity
    Vector-->>YTO: Assigned category
    end
    
    rect rgb(255, 250, 240)
    Note over YTO,DB: PHASE 3: STORAGE
    YTO->>Repo: storeContent(text, embeddings, category)
    Repo->>DB: INSERT INTO media_embeddings
    DB-->>Repo: embeddingId
    Repo-->>YTO: embeddingId
    
    YTO->>Repo: saveYoutubeMediaData(media, youtube)
    Repo->>DB: INSERT INTO youtube_media
    DB-->>Repo: youtubeId
    Repo->>DB: INSERT INTO media
    DB-->>Repo: mediaId
    Repo-->>YTO: Success
    end
    
    YTO-->>API: {media, embeddings}
    API-->>User: 200 OK with metadata
```

---

## 🎯 YouTube Processing Pipeline

```mermaid
flowchart TD
    Start([User Submits YouTube Link]) --> Parse[Parse Video ID]
    
    Parse --> Fetch[Fetch Video Metadata<br/>from YouTube API]
    
    Fetch --> Extract1[Extract General Data]
    Extract1 --> Extract2[Extract YouTube-Specific Data]
    Extract2 --> Extract3[Fetch English Captions]
    Extract3 --> Extract4[Extract Tags using AI]
    
    Extract4 --> Preprocess[Preprocess Content]
    
    subgraph Preprocessing["Text Preprocessing"]
        Preprocess --> Clean[Clean Text]
        Clean --> Token[Tokenize]
        Token --> Stop[Remove Stopwords]
        Stop --> Norm[Normalize]
    end
    
    Norm --> GenEmbed[Generate Content Embedding<br/>Voyage AI - 1024 dimensions]
    
    GenEmbed --> CheckCache{Category<br/>Embeddings<br/>Cached?}
    
    CheckCache -->|No| GenCat[Generate Category Embeddings]
    GenCat --> StoreCache[Store in Cache]
    StoreCache --> Compare
    
    CheckCache -->|Yes| LoadCache[Load from Cache]
    LoadCache --> Compare[Calculate Cosine Similarity]
    
    subgraph Categories["6 Categories"]
        Compare --> Cat1[Learning & Skills]
        Compare --> Cat2[Mindset & Focus]
        Compare --> Cat3[Decision Making]
        Compare --> Cat4[Industry Trends]
        Compare --> Cat5[Health & Wellness]
        Compare --> Cat6[Career Growth]
    end
    
    Cat1 --> Sort[Sort by Similarity Score]
    Cat2 --> Sort
    Cat3 --> Sort
    Cat4 --> Sort
    Cat5 --> Sort
    Cat6 --> Sort
    
    Sort --> Assign[Assign Best Category]
    
    Assign --> Store1[Store Embeddings]
    Store1 --> Store2[Store YouTube Data]
    Store2 --> Store3[Store Media Data]
    
    Store3 --> End([Return Complete Metadata])
    
    style Start fill:#e1f5ff
    style Preprocessing fill:#fff3e0
    style Categories fill:#f3e5f5
    style End fill:#c8e6c9
```

---

## 🏛️ Layered Architecture

```mermaid
graph TB
    subgraph Layer1["📱 PRESENTATION LAYER"]
        direction LR
        L1A[Home Page<br/>Server-Side Rendered]
        L1B[Video Detail Page]
        L1C[Category Pages]
        L1D[Search Interface]
    end
    
    subgraph Layer2["🔌 API LAYER"]
        direction LR
        L2A[GET /api/videos]
        L2B[GET /api/videos/id]
        L2C[GET /api/videos/query]
        L2D[POST /api/summarize]
    end
    
    subgraph Layer3["🎯 ORCHESTRATION LAYER"]
        direction LR
        L3A[YouTube Orchestrator]
        L3B[Workflow Coordination]
        L3C[Error Handling]
    end
    
    subgraph Layer4["⚙️ SERVICE LAYER"]
        direction LR
        L4A[YouTube Services]
        L4B[Embedding Services]
        L4C[Vector Services]
        L4D[Content Services]
    end
    
    subgraph Layer5["💾 REPOSITORY LAYER"]
        direction LR
        L5A[YouTube Repository]
        L5B[Embedding Repository]
        L5C[Query Building]
    end
    
    subgraph Layer6["🗄️ DATABASE LAYER"]
        direction LR
        L6A[(media)]
        L6B[(youtube_media)]
        L6C[(embeddings)]
    end
    
    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4
    Layer4 --> Layer5
    Layer5 --> Layer6
    
    style Layer1 fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style Layer2 fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Layer3 fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style Layer4 fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style Layer5 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Layer6 fill:#fce4ec,stroke:#880e4f,stroke-width:2px
```

---

## 🧠 AI/ML Pipeline

```mermaid
flowchart LR
    subgraph Input["📥 INPUT"]
        Video[YouTube Video]
        Title[Title]
        Desc[Description]
        Caps[Captions]
    end
    
    subgraph Process["🔄 PROCESSING"]
        Combine[Combine All Text]
        Clean[Clean & Preprocess]
        Embed[Generate Embeddings<br/>Voyage AI]
    end
    
    subgraph Classify["🎯 CLASSIFICATION"]
        CatEmbed[Category Embeddings]
        Cosine[Cosine Similarity]
        Best[Select Best Match]
    end
    
    subgraph Output["📤 OUTPUT"]
        Category[Assigned Category]
        Vector[1024-dim Vector]
        Store[Store in Database]
    end
    
    Video --> Title
    Video --> Desc
    Video --> Caps
    
    Title --> Combine
    Desc --> Combine
    Caps --> Combine
    
    Combine --> Clean
    Clean --> Embed
    
    Embed --> Cosine
    CatEmbed --> Cosine
    Cosine --> Best
    
    Best --> Category
    Embed --> Vector
    Category --> Store
    Vector --> Store
    
    style Input fill:#e1f5ff
    style Process fill:#fff3e0
    style Classify fill:#f3e5f5
    style Output fill:#c8e6c9
```

---

## 🔐 Technology Stack

```mermaid
mindmap
  root((YouTube<br/>Platform))
    Frontend
      Next.js 15
      React 19
      TypeScript
      Tailwind CSS
      Server Components
    Backend
      Next.js API Routes
      Node.js
      Drizzle ORM
    Database
      PostgreSQL
      pgvector Extension
      Connection Pooling
    AI/ML
      Voyage AI
        Embeddings
        1024 dimensions
      Google Gemini
        Summarization
      LangChain
        Orchestration
    External
      YouTube Data API v3
        Metadata
        Captions
    State
      Redux Toolkit
      Zustand Cache
```

---

## 📈 API Endpoints

### **GET /api/videos**
```typescript
// Fetch all videos with pagination
Response: {
  body: Media[],
  status: 200
}
```

### **GET /api/videos/[id]**
```typescript
// Fetch single video by ID
Response: {
  body: {
    id: number,
    title: string,
    platform: "youtube",
    category: string,
    thumbnailUrl: string,
    postUrl: string,
    youtubeId: number,
    embeddingId: number
  },
  status: 200
}
```

### **GET /api/videos/query?query=search**
```typescript
// Search videos by title
Response: {
  body: Media[],
  status: 200
}
```

### **GET /api/videos/category/[category]**
```typescript
// Filter by category
Response: {
  body: Media[],
  status: 200
}
```

### **POST /api/summarize**
```typescript
// Generate AI summary from captions
Request: {
  captionbody: string
}
Response: {
  summary: string
}
```

---

## 🎓 Key Features

### **1. Automatic Content Ingestion**
- Parse YouTube URLs
- Fetch video metadata
- Extract captions automatically
- Handle multiple video formats (regular, shorts)

### **2. AI-Powered Categorization**
- Semantic understanding using embeddings
- 6 predefined categories
- Cosine similarity matching
- 1024-dimensional vectors

### **3. Smart Caching**
- Category embeddings cached
- Reduces API calls to Voyage AI
- Improves performance significantly

### **4. Full-Text Search**
- Search by video title
- Case-insensitive matching
- Fast PostgreSQL queries

### **5. Server-Side Rendering**
- Fast initial page loads
- SEO-friendly
- Optimized performance

---

## 🔄 Request Flow Example

```mermaid
sequenceDiagram
    participant Browser
    participant Next as Next.js Server
    participant API
    participant DB as PostgreSQL

    Note over Browser,DB: User visits homepage
    Browser->>Next: GET /
    Next->>DB: SELECT * FROM media LIMIT 9
    DB-->>Next: Return videos
    Next-->>Browser: Render SSR page
    
    Note over Browser,DB: User searches
    Browser->>API: GET /api/videos/query?q=AI
    API->>DB: SELECT WHERE title ILIKE '%AI%'
    DB-->>API: Return results
    API-->>Browser: JSON response
    
    Note over Browser,DB: User views video
    Browser->>API: GET /api/videos/123
    API->>DB: SELECT WHERE id = 123
    DB-->>API: Return video data
    API-->>Browser: JSON response
```

---

## 💡 Key Design Decisions

### **1. Why Orchestrator Pattern?**
- Coordinates complex multi-step workflow
- Centralizes error handling
- Makes testing easier
- Clear separation of concerns

### **2. Why pgvector?**
- Native PostgreSQL extension
- No separate vector database needed
- Efficient similarity search
- Keeps data together

### **3. Why Voyage AI?**
- High-quality embeddings
- Batch processing support
- 1024 dimensions (good balance)
- Cost-effective

### **4. Why Next.js 15?**
- Full-stack framework
- Server-side rendering
- API routes built-in
- Excellent developer experience

### **5. Why Drizzle ORM?**
- Type-safe queries
- Lightweight
- Great TypeScript support
- Easy migrations

---

## 🚀 Performance Optimizations

```mermaid
graph TD
    A[Performance] --> B[Caching]
    A --> C[Database]
    A --> D[API]
    A --> E[Frontend]
    
    B --> B1[Category embeddings cached]
    B --> B2[Zustand for state]
    B --> B3[Future: Redis cache]
    
    C --> C1[Indexes on title, category]
    C --> C2[Connection pooling]
    C --> C3[Pagination LIMIT 9]
    C --> C4[pgvector indexes]
    
    D --> D1[Batch embedding generation]
    D --> D2[Retry logic with backoff]
    D --> D3[Error handling]
    
    E --> E1[Server components]
    E --> E2[Image optimization]
    E --> E3[Code splitting]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fff9c4
```

---

## 📊 Data Storage Strategy

### **Normalized Structure**
- `media` table: Common fields across all platforms
- `youtube_media` table: YouTube-specific data
- `media_embeddings` table: Vector data

### **Why This Design?**
✅ Avoids NULL columns
✅ Easy to add new platforms
✅ Maintains referential integrity
✅ Efficient queries

### **JSONB Usage**
- Captions stored as JSONB array
- Flexible nested structure
- No need for separate caption table
- Fast queries with GIN indexes

---

## 🎯 Categories

1. **Learning & Skills** - Educational content, tutorials, courses
2. **Mindset & Focus** - Productivity, concentration, mental frameworks
3. **Decision Making** - Strategic thinking, problem-solving
4. **Industry Trends** - Tech trends, market analysis, innovations
5. **Health & Wellness** - Physical and mental health, work-life balance
6. **Career Growth** - Professional development, advancement strategies

---

## 📝 Summary

This architecture demonstrates:

✅ **Clean Architecture** - Layered design with clear boundaries
✅ **AI Integration** - Sophisticated embedding pipeline
✅ **Type Safety** - Full TypeScript coverage
✅ **Performance** - Caching and optimization strategies
✅ **Scalability** - Designed for growth
✅ **Maintainability** - Modular and testable
✅ **Modern Stack** - Latest technologies and best practices

**Perfect for explaining in interviews!** 🚀
