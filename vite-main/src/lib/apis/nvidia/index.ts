import { createOpenAITextStream } from '$lib/apis/streaming';

export const NVIDIA_MODELS = [
        {
                id: 'nvidia:moonshotai/kimi-k2-instruct-0905',
                name: 'Kimi K2 Instruct',
                model: 'moonshotai/kimi-k2-instruct-0905',
                owned_by: 'openai' as const,
                external: true,
                source: 'nvidia'
        },
        {
                id: 'nvidia:deepseek-ai/deepseek-v3.1',
                name: 'DeepSeek V3.1',
                model: 'deepseek-ai/deepseek-v3.1',
                owned_by: 'openai' as const,
                external: true,
                source: 'nvidia'
        },
        {
                id: 'nvidia:bytedance/seed-oss-36b-instruct',
                name: 'Seed OSS 36B Instruct',
                model: 'bytedance/seed-oss-36b-instruct',
                owned_by: 'openai' as const,
                external: true,
                source: 'nvidia'
        },
        {
                id: 'nvidia:openai/gpt-oss-120b',
                name: 'GPT OSS 120B',
                model: 'openai/gpt-oss-120b',
                owned_by: 'openai' as const,
                external: true,
                source: 'nvidia'
        }
];

export const isNvidiaModel = (modelId: string): boolean => {
        return modelId.startsWith('nvidia:');
};

export const getNvidiaModelName = (modelId: string): string => {
        const model = NVIDIA_MODELS.find((m) => m.id === modelId);
        return model?.model || modelId.replace('nvidia:', '');
};

export interface NvidiaChatMessage {
        role: 'system' | 'user' | 'assistant';
        content: string;
}

export interface NvidiaChatCompletionRequest {
        model: string;
        messages: NvidiaChatMessage[];
        stream?: boolean;
        temperature?: number;
        top_p?: number;
        frequency_penalty?: number;
        presence_penalty?: number;
}

export const nvidiaChatCompletion = async (
        body: NvidiaChatCompletionRequest
): Promise<[Response | null, AbortController]> => {
        const controller = new AbortController();
        let error = null;

        const requestBody = {
                model: body.model,
                messages: body.messages,
                stream: body.stream ?? true,
                ...(body.temperature !== undefined && { temperature: body.temperature }),
                ...(body.top_p !== undefined && { top_p: body.top_p }),
                ...(body.frequency_penalty !== undefined && { frequency_penalty: body.frequency_penalty }),
                ...(body.presence_penalty !== undefined && { presence_penalty: body.presence_penalty })
        };

        const res = await fetch(`/api/chat/completions`, {
                signal: controller.signal,
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream'
                },
                body: JSON.stringify(requestBody)
        }).catch((err) => {
                console.error('Backend API Error:', err);
                error = err;
                return null;
        });

        if (error) {
                throw error;
        }

        return [res, controller];
};

export const nvidiaChatCompletionStream = (
        messages: NvidiaChatMessage[],
        modelId: string,
        params: {
                temperature?: number;
                top_p?: number;
                frequency_penalty?: number;
                presence_penalty?: number;
        } = {},
        onUpdate: (content: string, done: boolean, error?: string) => void,
        onStart?: (controller: AbortController) => void,
        onComplete?: () => void
): AbortController => {
        const controller = new AbortController();

        if (onStart) onStart(controller);

        const runStream = async () => {
                let terminalCallbackFired = false;
                
                const emitTerminal = (error?: string) => {
                        if (terminalCallbackFired) return;
                        terminalCallbackFired = true;
                        onUpdate('', true, error);
                        if (onComplete) onComplete();
                };
                
                try {
                        const requestBody = {
                                model: modelId,
                                messages: messages,
                                stream: true,
                                ...params
                        };

                        let response: Response;
                        try {
                                response = await fetch(`/api/chat/completions`, {
                                        signal: controller.signal,
                                        method: 'POST',
                                        headers: {
                                                'Content-Type': 'application/json',
                                                'Accept': 'text/event-stream'
                                        },
                                        body: JSON.stringify(requestBody)
                                });
                        } catch (fetchErr: any) {
                                if (fetchErr.name === 'AbortError') {
                                        emitTerminal();
                                } else {
                                        emitTerminal(fetchErr.message || 'Network error');
                                }
                                return;
                        }

                        if (!response.ok) {
                                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                                const errorMessage = errorData?.error?.message || errorData?.error || `HTTP ${response.status}`;
                                emitTerminal(errorMessage);
                                return;
                        }

                        if (!response.body) {
                                emitTerminal('No response body');
                                return;
                        }

                        let textStream;
                        try {
                                textStream = await createOpenAITextStream(response.body, true);
                        } catch (streamErr: any) {
                                emitTerminal(streamErr.message || 'Failed to create stream');
                                return;
                        }
                        
                        for await (const update of textStream) {
                                if (controller.signal.aborted) {
                                        emitTerminal();
                                        return;
                                }
                                
                                const { value, done, error } = update;
                                
                                if (error) {
                                        emitTerminal(typeof error === 'string' ? error : error.message || 'Stream error');
                                        return;
                                }
                                
                                if (done) {
                                        emitTerminal();
                                        return;
                                }
                                
                                if (value) {
                                        if (value.trim() === '' && controller.signal.aborted) {
                                                continue;
                                        }
                                        onUpdate(value, false);
                                }
                        }

                        emitTerminal();
                } catch (err: any) {
                        if (err.name === 'AbortError') {
                                emitTerminal();
                        } else {
                                console.error('Backend Stream Error:', err);
                                emitTerminal(err.message || 'Stream error');
                        }
                }
        };

        runStream();
        return controller;
};

export const generateNvidiaChatCompletion = async (
        modelId: string,
        messages: NvidiaChatMessage[],
        stream: boolean = true,
        params: Record<string, any> = {}
): Promise<any> => {
        const requestBody = {
                model: modelId,
                messages: messages,
                stream: stream,
                ...(params.temperature !== undefined && { temperature: params.temperature }),
                ...(params.top_p !== undefined && { top_p: params.top_p }),
                ...(params.frequency_penalty !== undefined && { frequency_penalty: params.frequency_penalty }),
                ...(params.presence_penalty !== undefined && { presence_penalty: params.presence_penalty })
        };

        const response = await fetch(`/api/chat/completions`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        ...(stream && { 'Accept': 'text/event-stream' })
                },
                body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData?.error?.message || `Backend API Error: ${response.status}`);
        }

        if (stream) {
                return response;
        }

        return response.json();
};
