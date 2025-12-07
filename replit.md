# Open WebUI

## Overview

Open WebUI is a comprehensive web-based user interface for interacting with AI language models. Built with SvelteKit 5, it provides a feature-rich chat interface with support for multiple AI providers (Ollama, OpenAI-compatible APIs), knowledge management, tools/functions, and extensive customization options. The application is designed as a Single Page Application (SPA) with static site generation for optimal performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **SvelteKit 5**: Primary framework with static adapter for SPA deployment
- **Vite**: Build tool and development server
- **TypeScript**: Type-safe development with strict mode enabled
- **Tailwind CSS 4**: Utility-first styling with custom color system and typography plugins
- Decision: SvelteKit was chosen for its excellent developer experience, performance, and built-in SSR/SSG capabilities. The static adapter enables deployment as a pure SPA while maintaining routing capabilities.

**UI Components & Libraries**
- **TipTap**: Rich text editor for note-taking and content creation
- **CodeMirror 6**: Code editing with syntax highlighting for multiple languages
- **Chart.js**: Data visualization for analytics
- **XYFlow**: Node-based workflow/diagram visualization
- **bits-ui**: Accessible UI component primitives
- Decision: Component libraries were selected for accessibility and customization flexibility rather than using a monolithic UI framework.

**State Management**
- **Svelte Stores**: Native reactive state management using writable stores
- **Context API**: Component-level state sharing for i18n, user preferences, and configuration
- Key stores include: `user`, `config`, `settings`, `models`, `chatId`, `mobile`, `theme`
- Decision: Svelte's built-in store system provides sufficient reactivity without external state management libraries.

**Internationalization (i18n)**
- **i18next**: Translation framework with browser language detection
- **i18next-parser**: Extraction tool for translation keys
- Dynamic locale loading from `src/lib/i18n/locales/{locale}/translation.json`
- Decision: i18next provides mature i18n capabilities with good TypeScript support and community ecosystem.

**Real-time Communication**
- **Socket.io Client**: WebSocket connections for live updates and active user tracking
- **EventSource**: Server-Sent Events for streaming chat responses
- Decision: Socket.io for bidirectional communication, SSE for unidirectional streaming of AI responses.

### Styling & Theming

**CSS Architecture**
- Custom CSS variable system for theming (`--color-gray-*`, `--app-text-scale`)
- Dark mode support via class-based toggling
- Responsive design with mobile-first approach
- Custom font loading: Inter, Archivo, Mona Sans, InstrumentSerif, Vazirmatn
- Decision: CSS variables enable runtime theme switching without rebuilding styles.

### File Processing & Media

**Document Processing**
- PDF.js: Client-side PDF rendering and text extraction
- TurnDown: HTML to Markdown conversion
- HEIC to JPEG conversion support
- Multiple file format support (PDF, DOCX, code files, audio)
- Decision: Client-side processing reduces server load and improves privacy.

**Media Handling**
- Audio processing: MP3, WAV, OGG, M4A
- Video embedding support
- Image upload and display
- File size validation and formatting utilities

### AI & ML Features

**Text-to-Speech (TTS)**
- **Kokoro-JS**: Web-based TTS using ONNX Runtime
- Web Workers for background processing (`kokoro.worker.ts`)
- WebGPU/WASM backend detection for optimal performance
- AudioQueue system for sequential audio playback
- Decision: Client-side TTS maintains privacy and reduces API costs.

**Transformers & AI Models**
- **@huggingface/transformers**: Client-side model inference
- ONNX Runtime Web: Optimized neural network execution
- Support for multiple model backends (WebGPU, WASM)

### Authentication & Authorization

**OAuth Integration**
- **@azure/msal-browser**: Microsoft Authentication Library for OneDrive/SharePoint
- Google Drive API: OAuth flow for file picker
- Session-based authentication with JWT tokens
- Decision: MSAL provides robust Microsoft identity platform integration; separate OAuth implementations for each provider maintain flexibility.

**Access Control**
- Role-based permissions (read/write)
- Group and user-level access controls
- Public/private sharing modes

### Data Management

**Knowledge Base**
- Document upload and indexing
- RAG (Retrieval-Augmented Generation) support via retrieval API
- File metadata tracking and versioning
- Decision: Knowledge management is API-driven, allowing backend flexibility.

**Chat & Conversation Management**
- Local chat history storage
- Folder organization for chats
- Tags and categorization system
- Export/import functionality
- Decision: Client-side storage with backend sync enables offline capabilities.

### Code Features

**Code Editing & Display**
- Multiple language support via CodeMirror language packages
- Syntax highlighting with highlight.js
- Code block copying functionality
- Elixir and HCL language support
- Decision: CodeMirror 6 provides modern, extensible code editing with better performance than legacy editors.

### Workflow & Automation

**Tools & Functions**
- Custom tool/function creation and management
- OpenAPI specification support
- Tool valves (parameters) configuration
- Server-side tool execution
- Decision: Tools are defined on the backend but managed through the UI for flexibility.

### Development & Build

**Developer Experience**
- Hot Module Replacement (HMR) via Vite
- TypeScript strict mode for type safety
- ESLint + Prettier for code quality
- Source maps disabled in production for smaller builds
- Version tracking via Git commit hash
- Decision: Modern tooling improves developer productivity while maintaining production performance.

**Build Output**
- Static HTML generation with SPA fallback
- Minification disabled for easier debugging (can be enabled)
- Asset optimization and code splitting
- Version polling for update detection (60-second interval)

## External Dependencies

### Third-Party APIs

**AI Model Providers**
- Ollama API: Local model inference
- OpenAI-compatible APIs: External model providers
- NVIDIA API: Integrated via standalone Hono backend server
  - Supported models: nvidia:moonshotai/kimi-k2-instruct-0905, nvidia:deepseek-ai/deepseek-v3.1, nvidia:bytedance/seed-oss-36b-instruct, nvidia:openai/gpt-oss-120b
  - Implementation: Hono API endpoints (backend/server.ts) proxy to NVIDIA API
  - API key hardcoded in backend/server.ts
  - Streaming support via SSE
- Custom API base URLs configurable per deployment

### Hono Backend (Standalone Server)

**Hono API Server** (port 3000)
- **Framework**: Hono with @hono/node-server
- **Location**: backend/server.ts
- **Endpoints**:
  - GET /health - Health check
  - GET /api/models - List available NVIDIA models
  - GET /api/v1/config - App configuration (features, locale, default models)
  - GET /api/v1/users/me - Current user info
  - POST /api/chat/completions - Streaming chat completions proxy
- **Streaming**: Uses native fetch with SSE streaming via hono/streaming
- **Architecture**: Standalone server with CORS enabled
- **Port**: 3000 (separate from frontend on port 5000)
- **Vite Proxy**: Frontend proxies /api/* and /health requests to backend via Vite dev server

**Cloud Storage Integration**
- Google Drive API: File selection and upload
- Microsoft OneDrive API: Personal and business accounts via MSAL
- SharePoint: Document library access

**Audio Services**
- Audio API endpoint: `/api/v1/audio`
- TTS generation and processing

### Backend Services

**Core API Endpoints**
- WebUI API: `/api/v1/*` - Primary application API
- Models API: `/api/models/*` - Model management
- Retrieval API: `/api/v1/retrieval` - Knowledge base queries
- Images API: `/api/v1/images` - Image generation and processing

### Databases & Storage

**Note**: The application expects a backend API to handle data persistence. Based on the environment variables (`DATABASE_URL`, `PGPORT`, `PGPASSWORD`), PostgreSQL may be used by the backend, but the frontend is database-agnostic and communicates exclusively through REST APIs.

### External Libraries

**Utilities**
- uuid (v4): Unique identifier generation
- js-sha256: Cryptographic hashing
- dayjs: Date/time manipulation with localization
- yaml: YAML parsing for configurations
- devalue: Serialization for SSR/SPA data transfer
- async: Asynchronous flow control
- file-saver: Client-side file downloads
- dompurify: XSS protection for HTML sanitization
- marked: Markdown parsing and rendering

**UI Enhancement**
- alpinejs: Lightweight interactivity framework
- svelte-confetti: Celebration animations
- panzoom: Image/diagram pan and zoom functionality

**Development Dependencies**
- @sveltejs/adapter-static: Static site generation
- i18next-parser: Translation key extraction
- eslint + prettier: Code quality tools
- sass-embedded: SASS compilation