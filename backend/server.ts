import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { streamSSE } from 'hono/streaming';

const app = new Hono();

const NVIDIA_API_KEY = "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";
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const AVAILABLE_MODELS = [
  {
    id: "nvidia:moonshotai/kimi-k2-instruct-0905",
    name: "Kimi K2 Instruct",
    provider: "NVIDIA",
    description: "Moonshot AI Kimi K2 model"
  },
  {
    id: "nvidia:deepseek-ai/deepseek-v3.1",
    name: "DeepSeek V3.1",
    provider: "NVIDIA",
    description: "DeepSeek AI V3.1 model"
  },
  {
    id: "nvidia:bytedance/seed-oss-36b-instruct",
    name: "Seed OSS 36B",
    provider: "NVIDIA",
    description: "ByteDance Seed OSS 36B Instruct"
  },
  {
    id: "nvidia:openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "NVIDIA",
    description: "OpenAI GPT OSS 120B model"
  }
];

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Type'],
  credentials: true
}));

app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    version: '1.0.0'
  });
});

app.get('/api/config', (c) => {
  return c.json({
    status: true,
    name: 'Open WebUI',
    version: '0.6.40',
    default_locale: 'pl-PL',
    default_models: 'nvidia:moonshotai/kimi-k2-instruct-0905',
    default_prompt_suggestions: [
      { content: 'Help me study', title: ['Help me study', 'vocabulary for a college entrance exam'] },
      { content: 'Give me ideas', title: ['Give me ideas', 'for what to do with my kids art'] },
      { content: 'Tell me a fun fact', title: ['Tell me a fun fact', 'about the Roman Empire'] },
      { content: 'Show me a code snippet', title: ['Show me a code snippet', 'of a website sticky header'] }
    ],
    features: {
      auth: false,
      auth_trusted_header: false,
      enable_api_keys: false,
      enable_signup: false,
      enable_login_form: false,
      enable_web_search: false,
      enable_google_drive_integration: false,
      enable_onedrive_integration: false,
      enable_image_generation: false,
      enable_admin_export: false,
      enable_admin_chat_access: true,
      enable_community_sharing: true,
      enable_autocomplete_generation: false,
      enable_direct_connections: false,
      enable_version_update_check: false
    },
    oauth: {
      providers: {}
    }
  });
});

app.get('/api/v1/models', (c) => {
  const modelsForOpenWebUI = AVAILABLE_MODELS.map(m => ({
    id: m.id,
    name: m.name,
    owned_by: 'openai',
    external: true,
    source: 'nvidia',
    info: {
      meta: {
        capabilities: {
          vision: false,
          usage: true
        }
      }
    }
  }));
  return c.json(modelsForOpenWebUI);
});

app.get('/api/models', (c) => {
  const modelsForOpenWebUI = AVAILABLE_MODELS.map(m => ({
    id: m.id,
    name: m.name,
    owned_by: 'openai',
    external: true,
    source: 'nvidia',
    info: {
      meta: {
        capabilities: {
          vision: false,
          usage: true
        }
      }
    }
  }));
  return c.json({ data: modelsForOpenWebUI });
});

// Chat API endpoints (local-only, no server persistence)
app.get('/api/v1/chats', (c) => {
  return c.json([]);
});

app.get('/api/v1/chats/list', (c) => {
  return c.json([]);
});

app.get('/api/v1/chats/all/tags', (c) => {
  return c.json([]);
});

app.get('/api/v1/chats/pinned', (c) => {
  return c.json([]);
});

app.get('/api/v1/chats/:id', (c) => {
  return c.json({ error: 'Chat not found' }, 404);
});

app.post('/api/v1/chats/new', (c) => {
  return c.json({ success: true, id: 'local' });
});

app.post('/api/v1/chats/:id', (c) => {
  return c.json({ success: true });
});

app.delete('/api/v1/chats/:id', (c) => {
  return c.json({ success: true });
});

// Folders API endpoints
app.get('/api/v1/folders', (c) => {
  return c.json([]);
});

app.post('/api/v1/folders', (c) => {
  return c.json({ success: true });
});

// Tools API endpoints
app.get('/api/v1/tools', (c) => {
  return c.json([]);
});

// Functions API endpoints
app.get('/api/v1/functions', (c) => {
  return c.json([]);
});

// Channels API endpoints
app.get('/api/v1/channels', (c) => {
  return c.json([]);
});

// Banners API endpoints
app.get('/api/v1/banners', (c) => {
  return c.json([]);
});

app.post('/api/chat/completions', async (c) => {
  const body = await c.req.json();
  
  let modelId = body.model;
  if (modelId.startsWith('nvidia:')) {
    modelId = modelId.slice(7);
  }
  
  const payload = {
    model: modelId,
    messages: body.messages,
    stream: body.stream ?? true,
    temperature: body.temperature ?? 0.7,
    top_p: body.top_p ?? 0.9
  };
  
  const headers = {
    'Authorization': `Bearer ${NVIDIA_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': payload.stream ? 'text/event-stream' : 'application/json'
  };
  
  if (payload.stream) {
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      c.status(response.status as any);
      return c.json({ error: errorText });
    }
    
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    c.header('X-Accel-Buffering', 'no');
    
    return streamSSE(c, async (stream) => {
      const reader = response.body?.getReader();
      if (!reader) return;
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              await stream.writeSSE({ data: line.slice(6) });
            } else if (line.trim()) {
              await stream.writeSSE({ data: line });
            }
          }
        }
        
        if (buffer.trim()) {
          if (buffer.startsWith('data: ')) {
            await stream.writeSSE({ data: buffer.slice(6) });
          } else {
            await stream.writeSSE({ data: buffer });
          }
        }
        
        await stream.writeSSE({ data: '[DONE]' });
      } catch (error) {
        await stream.writeSSE({ data: JSON.stringify({ error: String(error) }) });
      }
    });
  } else {
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      c.status(response.status as any);
      return c.json({ error: errorText });
    }
    
    return c.json(await response.json());
  }
});

const port = 3000;
console.log(`Backend server running on http://0.0.0.0:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
});
