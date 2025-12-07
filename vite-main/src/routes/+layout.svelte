<script>
        import { Toaster } from 'svelte-sonner';
        import { browser } from '$app/environment';

        import { onMount, setContext } from 'svelte';
        import {
                config,
                user,
                settings,
                theme,
                WEBUI_NAME,
                mobile,
                models
        } from '$lib/stores';

        import i18n, { initI18n } from '$lib/i18n';
        import { NVIDIA_MODELS } from '$lib/apis/nvidia';

        import '../tailwind.css';
        import '../app.css';

        import { WEBUI_BASE_URL } from '$lib/constants';

        setContext('i18n', i18n);

        const BREAKPOINT = 768;

        const fallbackConfig = {
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
        };

        const defaultUser = {
                id: 'default',
                name: 'User',
                role: 'admin',
                profile_image_url: '/static/favicon.png',
                permissions: {
                        chat: {
                                temporary_enforced: false,
                                multiple_models: true
                        },
                        features: {
                                image_generation: true,
                                code_interpreter: true,
                                web_search: true
                        }
                }
        };

        const nvidiaModelsForStore = NVIDIA_MODELS.map(m => ({
                ...m,
                info: {
                        meta: {
                                capabilities: {
                                        vision: false,
                                        usage: true
                                }
                        }
                }
        }));

        function cleanupDuplicateChats() {
                try {
                        localStorage.removeItem('openwebui_local_chats');
                        localStorage.removeItem('chats');
                } catch (e) {
                }
        }

        function getSystemTheme() {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function applyTheme(themeValue) {
                let themeToApply = themeValue;
                
                if (themeValue === 'system') {
                        themeToApply = getSystemTheme();
                } else if (themeValue === 'oled-dark') {
                        themeToApply = 'dark';
                }
                
                document.documentElement.classList.remove('dark', 'light', 'oled-dark');
                document.documentElement.classList.add(themeToApply);
                
                if (themeValue === 'oled-dark') {
                        document.documentElement.style.setProperty('--color-gray-800', '#101010');
                        document.documentElement.style.setProperty('--color-gray-850', '#050505');
                        document.documentElement.style.setProperty('--color-gray-900', '#000000');
                        document.documentElement.style.setProperty('--color-gray-950', '#000000');
                } else if (themeToApply === 'dark') {
                        document.documentElement.style.setProperty('--color-gray-800', '#333');
                        document.documentElement.style.setProperty('--color-gray-850', '#262626');
                        document.documentElement.style.setProperty('--color-gray-900', '#171717');
                        document.documentElement.style.setProperty('--color-gray-950', '#0d0d0d');
                }
                
                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor) {
                        metaThemeColor.setAttribute('content', themeToApply === 'light' ? '#ffffff' : themeValue === 'oled-dark' ? '#000000' : '#171717');
                }
        }

        async function fetchConfig() {
                try {
                        const res = await fetch(`${WEBUI_BASE_URL}/api/config`);
                        if (res.ok) {
                                return await res.json();
                        }
                } catch (e) {
                        console.log('Using fallback config, backend not available:', e);
                }
                return fallbackConfig;
        }

        async function fetchModels() {
                try {
                        const res = await fetch(`${WEBUI_BASE_URL}/api/v1/models`);
                        if (res.ok) {
                                return await res.json();
                        }
                } catch (e) {
                        console.log('Using fallback models, backend not available:', e);
                }
                return nvidiaModelsForStore;
        }

        if (browser) {
                cleanupDuplicateChats();
                config.set(fallbackConfig);
                WEBUI_NAME.set(fallbackConfig.name);
                user.set(defaultUser);
                models.set(nvidiaModelsForStore);
                
                const savedTheme = localStorage.getItem('theme') ?? 'system';
                theme.set(savedTheme);
                applyTheme(savedTheme);
                
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                        const currentTheme = localStorage.getItem('theme') ?? 'system';
                        if (currentTheme === 'system') {
                                applyTheme('system');
                        }
                });
                
                mobile.set(window.innerWidth < BREAKPOINT);
        }

        onMount(async () => {
                cleanupDuplicateChats();
                settings.set({});
                
                const savedTheme = localStorage.getItem('theme') ?? 'system';
                theme.set(savedTheme);
                applyTheme(savedTheme);
                
                mobile.set(window.innerWidth < BREAKPOINT);

                const [configData, modelsData] = await Promise.all([
                        fetchConfig(),
                        fetchModels()
                ]);

                config.set(configData);
                WEBUI_NAME.set(configData.name);
                user.set(defaultUser);
                models.set(modelsData);
                
                initI18n(configData.default_locale || 'pl-PL');

                const onResize = () => mobile.set(window.innerWidth < BREAKPOINT);
                window.addEventListener('resize', onResize);
                return () => window.removeEventListener('resize', onResize);
        });
</script>

<svelte:head>
        <title>{$WEBUI_NAME}</title>
        <link crossorigin="anonymous" rel="icon" href="{WEBUI_BASE_URL}/static/favicon.png" />
</svelte:head>

<slot />

<Toaster theme="dark" richColors position="top-right" />
