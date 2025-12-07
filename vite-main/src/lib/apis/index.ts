// Stub API module - all backend dependencies removed
// These functions return empty/default values to prevent compilation errors

export interface ModelConfig {
id: string;
name: string;
meta: ModelMeta;
base_model_id?: string;
params: ModelParams;
}

export interface ModelMeta {
toolIds: never[];
description?: string;
capabilities?: object;
profile_image_url?: string;
}

export interface ModelParams {}

export type GlobalModelConfig = ModelConfig[];

// All API functions now return empty/default values
export const getModels = async () => [];
export const chatCompleted = async () => null;
export const chatAction = async () => null;
export const stopTask = async () => null;
export const getTaskIdsByChatId = async () => [];
export const getToolServerData = async () => null;
export const getToolServersData = async () => [];
export const executeToolServer = async () => [null, null];
export const getTaskConfig = async () => ({});
export const updateTaskConfig = async () => ({});
export const generateTitle = async () => null;
export const generateFollowUps = async () => [];
export const generateTags = async () => [];
export const generateEmoji = async () => null;
export const generateQueries = async () => [];
export const generateAutoCompletion = async () => '';
export const generateMoACompletion = async () => [null, null];
export const getPipelinesList = async () => [];
export const uploadPipeline = async () => null;
export const downloadPipeline = async () => null;
export const deletePipeline = async () => null;
export const getPipelines = async () => [];
export const getPipelineValves = async () => null;
export const getPipelineValvesSpec = async () => null;
export const updatePipelineValves = async () => null;
export const getUsage = async () => ({});
export const getBackendConfig = async () => ({});
export const getChangelog = async () => ({});
export const getVersion = async () => ({ version: '0.0.0' });
export const getVersionUpdates = async () => null;
export const getModelFilterConfig = async () => ({ enabled: false, models: [] });
export const updateModelFilterConfig = async () => null;
export const getWebhookUrl = async () => '';
export const updateWebhookUrl = async () => '';
export const getCommunitySharingEnabledStatus = async () => false;
export const toggleCommunitySharingEnabledStatus = async () => false;
export const getModelConfig = async (): Promise<GlobalModelConfig> => [];
export const updateModelConfig = async () => null;
