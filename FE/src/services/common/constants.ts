import { Category, NavComponent, Platfrom, Resource } from "./types";

export const YOUTUBE_BASE_URL: string = `https://www.googleapis.com/youtube/v3/videos`;
export const REDDIT_BEARER_TOKEN_ENDPOINT: string = `https://www.reddit.com/api/v1/access_token`
export const SERVER_BASE_URL: string = `http://localhost:3000/`;
export const FORM_INSERT_API_URL:string = `/api/testing/test` 
export const SUMMARY_API_URL: string = `/api/summarize`;
export const DESKTOPSIZE:number = 1080;
export const MEDIA_PER_PAGE:number = 9;
export const Summary_Template:string = "Summarize the main points or the main theme of the whole document such that it can be used as notes for revision of concept maintaining all the scientific concepts and terms and explaining and adding the core idea in summary: {context}";

export const categories = (): Category[] => {
    const categories: Category[] = [
        {
            id: 1,
            title: "Learning & Skills",
            url: `/categories/${encodeURIComponent('Learning & Skills')}`,
            icon: 'skill'
        },
        {
            id: 2,
            title: "Mindset & Focus",
            url: `/categories/${encodeURIComponent('Mindset & Focus')}`,
            icon: 'mindset'
        },
        {
            id: 3,
            title: "Descision Making",
            url: `/categories/${encodeURIComponent('Descision Making & Strategy')}`,
            icon: 'strategy'
        },
        {
            id: 4,
            title: "Industry Trends",
            url: `/categories/${encodeURIComponent('Industry Trends')}`,
            icon: 'trends'
        },
        {
            id: 5,
            title: "Health & Wellness",
            url: `/categories/${encodeURIComponent('Health & Wellness')}`,
            icon: 'health'
        },
        {
            id: 6,
            title: "Career Growth",
            url: `/categories/${encodeURIComponent('Career Growth')}`,
            icon: 'growth'
        },
    ];
    return categories as Category[];
}

export const Platforms = (): Platfrom[] => {
    const platforms: Platfrom[] = [
        {
            name: 'youtube',
            url: `/video/${encodeURIComponent('youtube')}`,
            icon: `youtube`
        },
        {
            name: 'reddit',
            url: `/video/${encodeURIComponent('reddit')}`,
            icon: `reddit`
        }
    ]
    return platforms as Platfrom[];
}

export const navComponents = (): NavComponent[] => {
    const navs: NavComponent[] = [
        {
            'id': 1, 
            'title': 'dashboard',
            'url': `/navs/dashboard`,
            'icon': 'dashboard'
        },
        {
            'id': 2,
            'title': 'insert',
            'url': '/navs/insert',
            'icon': 'insert'
        }
    ];
    return navs as NavComponent[];
}

export const Resources = (): Resource[] => {
    const resos: Resource[] = [
        {
            'id': 1,
            'link': 'https://youtu.be/ECycCnPy1Qw?si=A0wGoo4e-5zpR0Hf'
        },
        {
            'id': 2,
            'link': 'https://youtu.be/RzRhcnN-2XQ?si=sB9zudHwOW0wPVmM'
        },
        {
            'id': 3,
            'link': 'https://youtu.be/xirQ7AMyTM8?si=GOyz0tQkYhC7QmNQ'
        },
        {
            'id': 4,
            'link': 'https://www.reddit.com/r/beastboyshub/comments/1izxl2m/omg_shinchan_is_finally_in_india/?utm_source=share&utm_medium=mweb3x&utm_name=post_embed&utm_term=1&utm_content=1'
        },
        {
            'id': 5,
            'link': 'https://www.youtube.com/watch?v=XeGsq5yQOXw'
        },
        {
            'id': 6,
            'link': 'https://youtu.be/6YzGOq42zLk?si=3TS6QIvk4dKQPYLs'
        },
        {
            'id': 7,
            'link': 'https://youtu.be/Fj6cr3FO2JI?si=7lL3nGGUa7UcCqJw'
        },
        {
            'id': 8,
            'link': 'https://www.reddit.com/r/cartoons/comments/1j269lv/flow_has_won_best_animated_film_at_the_oscars/?utm_source=share&utm_medium=mweb3x&utm_name=post_embed&utm_term=1&utm_content=1'
        },
        {
            'id': 9,
            'link': 'https://www.reddit.com/r/ShinChan/comments/1j46wnx/what_is_this/?utm_source=share&utm_medium=mweb3x&utm_name=post_embed&utm_term=1&utm_content=1'
        },
        {
            'id': 10,
            'link': 'https://youtu.be/9TdexGFlFIM?si=wQMXSNcFQCYtdiwQ'
        },
        {
            'id': 11,
            'link': 'https://youtu.be/TNhaISOUy6Q?si=HlOH5aHIJhyOKxdI'
        },
        {
            'id': 12,
            'link': 'https://youtu.be/Q4xCR20Dh1E?si=FBKeWcvv47yjPrAf'
        },
        {
            'id': 13,
            'link': 'https://www.youtube.com/watch?v=Q4xCR20Dh1E'
        },
        {
            'id': 14,
            'link': 'https://youtu.be/E4K7JgPJ8-s?si=85hsxzoixoE1X9Dm'
        }
    ]
    return resos as Resource[];
}

export const categoryDefinitions: Record<string, string> = {
    "Learning & Skills": "Educational content focusing on acquiring new knowledge, developing technical abilities, and mastering professional competencies. This includes instructional tutorials, comprehensive courses, step-by-step guides, practical demonstrations, skill-building exercises, educational lectures, technical training, professional certification preparation, academic learning resources, experiential learning methods, knowledge acquisition strategies, applied learning techniques, practical skills development, competency training, educational frameworks, technical education, professional development resources, practical knowledge transfer, instructional design, and pedagogical approaches for skill mastery.",
    "Mindset & Focus": "Content related to developing optimal mental frameworks, improving concentration abilities, and enhancing productivity through psychological techniques. This includes cognitive enhancement strategies, attention management techniques, mental resilience building, concentration improvement methods, deep work approaches, flow state achievement, distraction management, mental clarity practices, goal-oriented thinking, strategic focus maintenance, productivity mindset development, psychological optimization techniques, mental performance enhancement, cognitive discipline methods, sustained attention practices, professional focus strategies, mental prioritization frameworks, cognitive resource allocation, executive function improvement, and psychological approaches to peak performance.",
    "Decision Making": "Content centered on systematic approaches to evaluating options, strategic thinking methodologies, and frameworks for making optimal choices in professional contexts. This includes analytical reasoning processes, strategic evaluation methods, evidence-based decision frameworks, risk assessment models, probability analysis, outcome prediction techniques, decision matrices, cost-benefit analysis, judgment heuristics awareness, decision bias mitigation, logical reasoning approaches, strategic option analysis, choice architecture design, decision tree methodology, weighted criteria evaluation, stakeholder impact analysis, opportunity cost assessment, scenario planning for decisions, statistical decision models, and structured problem-solving methodologies.",
    "Industry Trends": "Forward-looking content analyzing developments, innovations, and directional shifts within professional fields and market sectors. This includes emerging technology analysis, market transformation insights, sector-specific forecasting, disruptive innovation identification, competitive landscape assessment, regulatory impact evaluation, growth sector analysis, industry evolution patterns, business model innovation trends, market convergence dynamics, professional paradigm shifts, industry adoption curves, technology integration forecasts, market maturity assessments, cross-industry pattern recognition, digital transformation impacts, sectoral disruption analysis, organizational adaptation strategies, future of work predictions, and strategic foresight methodologies.",
    "Health & Wellness": "Evidence-based content on maintaining optimal physical and mental condition to support professional performance and personal wellbeing. This includes cognitive performance optimization, stress management techniques, burnout prevention strategies, workplace ergonomics, exercise science for productivity, nutrition for cognitive function, sleep optimization for performance, recovery methodologies, mental health maintenance in professional settings, work-life balance strategies, energy management frameworks, cognitive load regulation, physical wellbeing for knowledge workers, resilience building practices, preventative health approaches, mindfulness for professional contexts, physiological optimization, psychological sustainability practices, attention restoration techniques, and evidence-based wellness interventions.",
    "Career Growth": "Strategic content on professional advancement, career trajectory management, and development of capabilities that enhance occupational progression. This includes professional advancement strategies, career path planning, leadership skill development, expertise cultivation methodology, professional network building, strategic skill acquisition, personal brand development, promotion qualification strategies, career transition frameworks, specialized expertise development, professional value proposition enhancement, strategic credential acquisition, career capital investment approaches, professional opportunity identification, career differentiation strategies, executive presence development, advancement barrier navigation, professional relevance maintenance, succession planning approaches, and systematic career progression methodologies."
};

export const Tags_Template:string = `You are an intelligent tagging agent. Your job is to generate useful, high-level tags from the given text content. These tags should:
      - Be concise and general (e.g. "quantum computing", "technology", "career growth", "mindset").
      - Help in categorizing the content into one or more of the following broader productivity-focused categories:
        - Learning & Skills
        - Mindset & Focus
        - Decision Making
        - Industry Trends
        - Health & Wellness
        - Career Growth

        Your response must be a comma-separated list of **10 relevant tags** that:
        1. Reflect the key ideas or topics in the content.
        2. Can be used to organize similar content in the future.
        3. Are not overly specific (avoid full sentences or hashtags).

        Content:
        """
        {data}
        """

        Now generate 10 reliable and general-purpose tags based on the content above.
        Return only the tags, in a comma-separated format.`

export const Audio_Output_Directory:string =`C://Users/Sheve/Desktop/crazy/linnkedOut_cloned/FE/audio`