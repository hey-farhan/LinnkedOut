# System Architecture Diagrams

## 🏗️ Complete System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ CLIENT LAYER"]
        UI[Next.js Frontend]
        SSR[Server-Side Rendering]
        Pages[React Pages & Components]
    end

    subgraph API["🔌 API LAYER - REST Endpoints"]
        Videos["/api/videos<br/>GET - List All"]
        VideoID["/api/videos/[id]<br/>GET - Single Video"]
        Query["/api/videos/query<br/>GET - Search"]
        Category["/api/videos/category<br/>GET - Filter"]
        Summarize["/api/summarize<br/>POST - AI Summary"]
        TestOrch["/api/test-orchestrator<br/>GET - Test Pipeline"]
    end

    subgraph Orchestration["🎯 ORCHESTRATION LAYER"]
        YTO[YouTube Orchestrator]
        RDO[Reddit Orchestrator]
        
        subgraph YTOFlow["YouTube Pipeline"]
            YTO1[1. Extract Metadata]
            YTO2[2. Fetch Captions]
            YTO3[3. Generate Embeddings]
            YTO4[4. Classify Category]
            YTO5[5. Store Data]
        end
        
        subgraph RDOFlow["Reddit Pipeline"]
            RDO1[1. Extract Post Data]
            RDO2[2. Fetch Comments]
            RDO3[3. Generate Embeddings]
            RDO4[4. Classify Category]
            RDO5[5. Store Data]
        end
    end

    subgraph Services["⚙️ SERVICE LAYER"]
        subgraph Platform["Platform Services"]
            YTS[YouTube API Service]
            RDS[Reddit API Service]
            YTM[YouTube Metadata Service]
            RDM[Reddit Metadata Service]
            YTT[YouTube Transcript Service]
        end
        
        subgraph Vector["Vector Services"]
            EmbedGen[Embedding Service]
            Preproc[Preprocessing Service]
            Cache[Cache Service]
        end
        
        subgraph Content["Content Services"]
            VectorStore[Vector Store Service]
            Summary[Summary Service]
        end
    end

    subgraph Repository["💾 REPOSITORY LAYER"]
        YTRepo[YouTube Media Repository]
        RDRepo[Reddit Media Repository]
        EmbedRepo[Embedding Repository]
    end

    subgraph Database["🗄️ DATABASE LAYER"]
        subgraph PostgreSQL["PostgreSQL + pgvector"]
            MediaTable[(media table)]
            YTTable[(youtube_media table)]
            RDTable[(reddit_media table)]
            EmbedTable[(media_embeddings table)]
        end
    end

    subgraph External["🌐 EXTERNAL SERVICES"]
        YouTubeAPI[YouTube Data API v3]
        RedditAPI[Reddit API]
        VoyageAPI[Voyage AI - Embeddings]
        GeminiAPI[Google Gemini - LLM]
    end

    %% Client to API connections
    UI --> Videos
    UI --> VideoID
    UI --> Query
    UI --> Category
    UI --> Summarize
    
    %% API to Orchestration
    Videos --> YTO
    Videos --> RDO
    TestOrch --> YTO
    Summarize --> Summary
    
    %% Orchestration to Services
    YTO --> YTS
    YTO --> YTM
    YTO --> YTT
    YTO --> EmbedGen
    YTO --> Preproc
    YTO --> VectorStore
    
    RDO --> RDS
    RDO --> RDM
    RDO --> EmbedGen
    RDO --> Preproc
    RDO --> VectorStore
    
    %% Services to External APIs
    YTS --> YouTubeAPI
    RDS --> RedditAPI
    EmbedGen --> VoyageAPI
    Summary --> GeminiAPI
    
    %% Orchestration to Repository
    YTO --> YTRepo
    YTO --> EmbedRepo
    RDO --> RDRepo
    RDO --> EmbedRepo
    
    %% Repository to Database
    YTRepo --> MediaTable
    YTRepo --> YTTable
    YTRepo --> EmbedTable
    
    RDRepo --> MediaTable
    RDRepo --> RDTable
    RDRepo --> EmbedTable
    
    EmbedRepo --> EmbedTable
    
    %% Styling
    classDef clientStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef apiStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef orchStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef serviceStyle fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef repoStyle fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef dbStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef externalStyle fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    
    class UI,SSR,Pages clientStyle
    class Videos,VideoID,Query,Category,Summarize,TestOrch apiStyle
    class YTO,RDO,YTO1,YTO2,YTO3,YTO4,YTO5,RDO1,RDO2,RDO3,RDO4,RDO5 orchStyle
    class YTS,RDS,YTM,RDM,YTT,EmbedGen,Preproc,Cache,VectorStore,Summary serviceStyle
    class YTRepo,RDRepo,EmbedRepo repoStyle
    class MediaTable,YTTable,RDTable,EmbedTable dbStyle
    class YouTubeAPI,RedditAPI,VoyageAPI,GeminiAPI externalStyle`
``

---

## 📊 Database Schema (ERD)

```mermaid
erDiagram
    media ||--o| youtube_media : "has"
    media ||--o| reddit_media : "has"
    media ||--o| media_embeddings : "has"
    
    media {
        int id PK
        enum type "short|image|video|photo"
        varchar platform "youtube|reddit"
        varchar thumbnail_url
        varchar post_url
        text title
        int duration_ms
        varchar post_id
        text category
        timestamp created_at
        timestamp updated_at
        int reddit_id FK
        int youtube_id FK
        int embedding_id FK
    }
    
    youtube_media {
        int id PK
        text description
        varchar definition
        jsonb english_captions
    }
    
    reddit_media {
        int id PK
        text subreddit
        text author
        varchar post_link
        jsonb comments
    }
    
    media_embeddings {
        int id PK
        text content
        vector embedding "1024 dimensions"
    }
```

---

## 🔄 Data Flow - YouTube Processing

```mermaid
sequenceDiagram
    participant User
    participant API as API Route
    participant YTO as YouTube Orchestrator
    participant YTS as YouTube Service
    participant YTA as YouTube API
    participant Embed as Embedding Service
    participant Voyage as Voyage AI
    participant Vector as Vector Store
    participant Repo as Repository
    participant DB as PostgreSQL

    User->>API: POST /api/test-orchestrator
    API->>YTO: mainYoutubeOrchestrator(link)
    
    Note over YTO: EXTRACTION PHASE
    YTO->>YTS: parseVideoId(link)
    YTS-->>YTO: videoId
    YTO->>YTS: fetchVideoMetadata(videoId)
    YTS->>YTA: GET video details
    YTA-->>YTS: metadata
    YTS-->>YTO: metadata
    YTO->>YTO: extractMediaData()
    YTO->>YTO: extractYoutubeData()
    YTO->>YTS: fetchTranscript(videoId)
    YTS->>YTA: GET captions
    YTA-->>YTS: captions
    YTS-->>YTO: captions
    
    Note over YTO: EMBEDDING PHASE
    YTO->>Embed: preprocessContent()
    Embed-->>YTO: cleanedText
    YTO->>Embed: generateEmbeddings(text)
    Embed->>Voyage: embedQuery(text)
    Voyage-->>Embed: embeddings[1024]
    Embed-->>YTO: embeddings
    YTO->>Vector: classifyEmbedding()
    Vector-->>YTO: category
    
    Note over YTO: STORAGE PHASE
    YTO->>Repo: storeContent()
    Repo->>DB: INSERT embeddings
    DB-->>Repo: embeddingId
    Repo-->>YTO: embeddingId
    YTO->>Repo: saveYoutubeMediaData()
    Repo->>DB: INSERT youtube_media
    DB-->>Repo: youtubeId
    Repo->>DB: INSERT media
    DB-->>Repo: mediaId
    Repo-->>YTO: success
    
    YTO-->>API: {media, embeddings}
    API-->>User: 200 OK
```

---

## 🔄 Data Flow - Reddit Processing

```mermaid
sequenceDiagram
    participant User
    participant API as API Route
    participant RDO as Reddit Orchestrator
    participant RDS as Reddit Service
    participant RDA as Reddit API
    participant Embed as Embedding Service
    participant Voyage as Voyage AI
    participant Vector as Vector Store
    participant Repo as Repository
    participant DB as PostgreSQL

    User->>API: POST with Reddit link
    API->>RDO: mainRedditOrchestrator(link)
    
    Note over RDO: EXTRACTION PHASE
    RDO->>RDS: parseRedditUrl(link)
    RDS-->>RDO: {subreddit, postId}
    RDO->>RDS: fetchVideoMetadata()
    RDS->>RDA: GET post details
    RDA-->>RDS: postData
    RDS-->>RDO: postData
    RDO->>RDO: extractMediaData()
    RDO->>RDO: extractRedditData()
    RDO->>RDS: extractTopComments()
    RDS-->>RDO: comments[]
    
    Note over RDO: EMBEDDING PHASE
    RDO->>Embed: preprocessContent()
    Embed-->>RDO: cleanedText
    RDO->>Embed: generateEmbeddings(text)
    Embed->>Voyage: embedQuery(text)
    Voyage-->>Embed: embeddings[1024]
    Embed-->>RDO: embeddings
    RDO->>Vector: classifyEmbedding()
    Vector-->>RDO: category
    
    Note over RDO: STORAGE PHASE
    RDO->>Repo: storeContent()
    Repo->>DB: INSERT embeddings
    DB-->>Repo: embeddingId
    Repo-->>RDO: embeddingId
    RDO->>Repo: saveRedditPostToDatabase()
    Repo->>DB: INSERT reddit_media
    DB-->>Repo: redditId
    Repo->>DB: INSERT media
    DB-->>Repo: mediaId
    Repo-->>RDO: success
    
    RDO-->>API: {media, embeddings}
    API-->>User: 200 OK
```

---

## 🎯 Category Classification Flow

```mermaid
flowchart TD
    Start([Content Input]) --> Preprocess[Preprocess Text]
    Preprocess --> Extract[Extract Key Info]
    Extract --> Clean[Clean & Tokenize]
    Clean --> Remove[Remove Stopwords]
    Remove --> Generate[Generate Content Embedding]
    
    Generate --> CheckCache{Category Embeddings<br/>Cached?}
    CheckCache -->|Yes| LoadCache[Load from Cache]
    CheckCache -->|No| GenCat[Generate Category Embeddings]
    GenCat --> StoreCache[Store in Cache]
    StoreCache --> LoadCache
    
    LoadCache --> Compare[Calculate Cosine Similarity]
    Compare --> Cat1[Learning & Skills]
    Compare --> Cat2[Mindset & Focus]
    Compare --> Cat3[Decision Making]
    Compare --> Cat4[Industry Trends]
    Compare --> Cat5[Health & Wellness]
    Compare --> Cat6[Career Growth]
    
    Cat1 --> Sort[Sort by Similarity Score]
    Cat2 --> Sort
    Cat3 --> Sort
    Cat4 --> Sort
    Cat5 --> Sort
    Cat6 --> Sort
    
    Sort --> Select[Select Highest Score]
    Select --> Assign[Assign Category]
    Assign --> End([Categorized Content])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style Generate fill:#fff9c4
    style Compare fill:#f3e5f5
    style Assign fill:#ffccbc
```

---

## 🏛️ Layered Architecture

```mermaid
graph LR
    subgraph Layer1["Presentation Layer"]
        A1[React Components]
        A2[Pages]
        A3[SSR]
    end
    
    subgraph Layer2["API Layer"]
        B1[REST Endpoints]
        B2[Request Validation]
        B3[Response Formatting]
    end
    
    subgraph Layer3["Orchestration Layer"]
        C1[YouTube Orchestrator]
        C2[Reddit Orchestrator]
        C3[Workflow Coordination]
    end
    
    subgraph Layer4["Service Layer"]
        D1[Platform Services]
        D2[Vector Services]
        D3[Content Services]
    end
    
    subgraph Layer5["Repository Layer"]
        E1[Data Access]
        E2[Query Building]
        E3[Transaction Management]
    end
    
    subgraph Layer6["Database Layer"]
        F1[(PostgreSQL)]
        F2[(pgvector)]
    end
    
    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4
    Layer4 --> Layer5
    Layer5 --> Layer6
    
    style Layer1 fill:#e1f5ff
    style Layer2 fill:#fff3e0
    style Layer3 fill:#f3e5f5
    style Layer4 fill:#e8f5e9
    style Layer5 fill:#fff9c4
    style Layer6 fill:#fce4ec
```

---

## 🔐 Technology Stack Diagram

```mermaid
mindmap
  root((Tech Stack))
    Frontend
      Next.js 15
      React 19
      TypeScript
      Tailwind CSS
      HeroUI
      Framer Motion
    Backend
      Next.js API Routes
      Node.js
      Drizzle ORM
      PostgreSQL
      pgvector
    AI/ML
      Voyage AI
      Google Gemini
      LangChain
      Vector Embeddings
    External APIs
      YouTube Data API
      Reddit API
    DevOps
      npm
      Turbopack
      Drizzle Kit
    State Management
      Redux Toolkit
      Zustand
```

---

## 📈 Scalability Architecture (Future)

```mermaid
graph TB
    subgraph LoadBalancer["Load Balancer"]
        LB[Nginx/AWS ALB]
    end
    
    subgraph AppServers["Application Servers"]
        App1[Next.js Instance 1]
        App2[Next.js Instance 2]
        App3[Next.js Instance 3]
    end
    
    subgraph Workers["Background Workers"]
        Worker1[YouTube Worker]
        Worker2[Reddit Worker]
        Worker3[Embedding Worker]
    end
    
    subgraph Queue["Message Queue"]
        MQ[Redis/RabbitMQ]
    end
    
    subgraph Cache["Caching Layer"]
        Redis[Redis Cache]
    end
    
    subgraph Database["Database Cluster"]
        Primary[(Primary DB)]
        Replica1[(Read Replica 1)]
        Replica2[(Read Replica 2)]
    end
    
    subgraph VectorDB["Vector Database"]
        PGVector[(pgvector)]
    end
    
    subgraph CDN["Content Delivery"]
        CloudFront[CloudFront/Vercel]
    end
    
    Users --> CloudFront
    CloudFront --> LB
    LB --> App1
    LB --> App2
    LB --> App3
    
    App1 --> Redis
    App2 --> Redis
    App3 --> Redis
    
    App1 --> MQ
    App2 --> MQ
    App3 --> MQ
    
    MQ --> Worker1
    MQ --> Worker2
    MQ --> Worker3
    
    App1 --> Replica1
    App2 --> Replica1
    App3 --> Replica2
    
    Worker1 --> Primary
    Worker2 --> Primary
    Worker3 --> Primary
    
    Primary --> Replica1
    Primary --> Replica2
    
    Worker3 --> PGVector
    App1 --> PGVector
    
    style LoadBalancer fill:#e1f5ff
    style AppServers fill:#fff3e0
    style Workers fill:#f3e5f5
    style Queue fill:#e8f5e9
    style Cache fill:#fff9c4
    style Database fill:#fce4ec
    style VectorDB fill:#ffccbc
    style CDN fill:#e0f2f1
```

---

## 🔄 Request Flow Example

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant NextJS as Next.js Server
    participant API as API Route
    participant Cache as Redis Cache
    participant DB as PostgreSQL
    participant External as External APIs

    Browser->>NextJS: GET /
    NextJS->>Cache: Check cached data
    alt Cache Hit
        Cache-->>NextJS: Return cached data
        NextJS-->>Browser: Render page (fast)
    else Cache Miss
        NextJS->>DB: Query media table
        DB-->>NextJS: Return media data
        NextJS->>Cache: Store in cache
        NextJS-->>Browser: Render page
    end
    
    Browser->>API: GET /api/videos/query?q=AI
    API->>DB: SELECT * WHERE title ILIKE '%AI%'
    DB-->>API: Return results
    API-->>Browser: JSON response
    
    Browser->>API: POST /api/summarize
    API->>External: Call Gemini API
    External-->>API: Return summary
    API-->>Browser: JSON response
```

---

## 📊 Performance Optimization Strategy

```mermaid
graph TD
    A[Performance Optimization] --> B[Caching Strategy]
    A --> C[Database Optimization]
    A --> D[API Optimization]
    A --> E[Frontend Optimization]
    
    B --> B1[Redis for API responses]
    B --> B2[Category embeddings cache]
    B --> B3[CDN for static assets]
    
    C --> C1[Database indexes]
    C --> C2[Connection pooling]
    C --> C3[Query optimization]
    C --> C4[Read replicas]
    
    D --> D1[Batch processing]
    D --> D2[Rate limiting]
    D --> D3[Request deduplication]
    D --> D4[Background workers]
    
    E --> E1[Code splitting]
    E --> E2[Image optimization]
    E --> E3[Server components]
    E --> E4[Lazy loading]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fff9c4
```

---

## 🎯 Key Architectural Patterns

### 1. **Orchestrator Pattern**
- Coordinates complex workflows
- Manages service dependencies
- Centralizes error handling
- Provides transaction boundaries

### 2. **Repository Pattern**
- Abstracts data access
- Enables testing with mocks
- Centralizes query logic
- Maintains separation of concerns

### 3. **Service Layer Pattern**
- Encapsulates business logic
- Promotes reusability
- Enables independent testing
- Facilitates microservices migration

### 4. **Layered Architecture**
- Clear separation of concerns
- Unidirectional dependencies
- Easy to understand and maintain
- Supports scalability

---

## 🚀 Deployment Architecture (Recommended)

```mermaid
graph TB
    subgraph Production["Production Environment"]
        subgraph Vercel["Vercel Platform"]
            NextApp[Next.js Application]
            Edge[Edge Functions]
        end
        
        subgraph AWS["AWS Services"]
            RDS[(RDS PostgreSQL)]
            ElastiCache[ElastiCache Redis]
            SQS[SQS Queue]
            Lambda[Lambda Workers]
        end
        
        subgraph Monitoring["Monitoring & Logging"]
            Sentry[Sentry - Error Tracking]
            DataDog[DataDog - Metrics]
            LogRocket[LogRocket - Session Replay]
        end
    end
    
    Users --> NextApp
    NextApp --> Edge
    NextApp --> RDS
    NextApp --> ElastiCache
    NextApp --> SQS
    SQS --> Lambda
    Lambda --> RDS
    
    NextApp --> Sentry
    NextApp --> DataDog
    NextApp --> LogRocket
    
    style Vercel fill:#e1f5ff
    style AWS fill:#fff3e0
    style Monitoring fill:#f3e5f5
```

---

## 📝 Summary

This architecture demonstrates:

✅ **Clean Separation of Concerns** - Each layer has a specific responsibility
✅ **Scalability** - Can scale horizontally with load balancers and workers
✅ **Maintainability** - Modular design makes changes easier
✅ **Testability** - Each component can be tested independently
✅ **Performance** - Caching, indexing, and optimization strategies
✅ **Modern Stack** - Latest technologies and best practices
✅ **AI Integration** - Sophisticated ML pipeline for content classification
✅ **Type Safety** - Full TypeScript coverage across all layers

This is a **production-ready architecture** that can handle real-world traffic and scale as needed.
