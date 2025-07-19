import { SupabaseClient } from '@supabase/supabase-js';
interface ElevenLabsWebhookResponse {
    result: string;
    error?: string;
}
/**
 * Handle ElevenLabs webhook calls to PINNLO MCP tools
 * These are called when ElevenLabs agents invoke server-side tools
 */
export declare class ElevenLabsWebhookHandler {
    private supabase;
    constructor(supabase: SupabaseClient);
    handleProcessVoiceIntelligence(params: any): Promise<ElevenLabsWebhookResponse>;
    handleGenerateStrategyCards(params: any): Promise<ElevenLabsWebhookResponse>;
    handleGenerateTechnicalRequirement(params: any): Promise<ElevenLabsWebhookResponse>;
    handleAnalyzeUrl(params: any): Promise<ElevenLabsWebhookResponse>;
    private processTextToIntelligence;
    private generateStrategyCardsFromPrompt;
    private generateTechnicalRequirementFromFeatures;
    private analyzeUrlContent;
}
export declare function setupElevenLabsWebhookRoutes(app: any, supabase: SupabaseClient): void;
export {};
//# sourceMappingURL=elevenlabs-webhook-handlers.d.ts.map