<script lang="ts">
        import { onMount, tick, getContext } from 'svelte';
        import { openDB, deleteDB } from 'idb';
        import fileSaver from 'file-saver';
        const { saveAs } = fileSaver;

        import { goto } from '$app/navigation';
        import { page } from '$app/stores';
        import { fade } from 'svelte/transition';

        import {
                config,
                user,
                settings,
                models,
                tools,
                functions,
                tags,
                banners,
                showSettings,
                showShortcuts,
                showChangelog,
                temporaryChatEnabled,
                toolServers,
                showSearch,
                showSidebar
        } from '$lib/stores';

        import Sidebar from '$lib/components/layout/Sidebar.svelte';
        import SettingsModal from '$lib/components/chat/SettingsModal.svelte';
        import ChangelogModal from '$lib/components/ChangelogModal.svelte';
        import { Shortcut, shortcuts } from '$lib/shortcuts';

        const i18n = getContext('i18n');

        let DB = null;
        let localDBChats = [];

        const clearChatInputStorage = () => {
                const chatInputKeys = Object.keys(localStorage).filter((key) => key.startsWith('chat-input'));
                if (chatInputKeys.length > 0) {
                        chatInputKeys.forEach((key) => {
                                localStorage.removeItem(key);
                        });
                }
        };

        const checkLocalDBChats = async () => {
                try {
                        DB = await openDB('Chats', 1);

                        if (!DB) {
                                return;
                        }

                        const chats = await DB.getAllFromIndex('chats', 'timestamp');
                        localDBChats = chats.map((item, idx) => chats[chats.length - 1 - idx]);

                        if (localDBChats.length === 0) {
                                await deleteDB('Chats');
                        }
                } catch (error) {
                }
        };

        onMount(async () => {
                clearChatInputStorage();
                await checkLocalDBChats();

                tools.set([]);
                functions.set([]);
                tags.set([]);
                banners.set([]);
                toolServers.set([]);

                const isShortcutMatch = (event: KeyboardEvent, shortcut): boolean => {
                        const keys = shortcut?.keys || [];

                        const normalized = keys.map((k) => k.toLowerCase());
                        const needCtrl = normalized.includes('ctrl') || normalized.includes('mod');
                        const needShift = normalized.includes('shift');
                        const needAlt = normalized.includes('alt');

                        const mainKeys = normalized.filter((k) => !['ctrl', 'shift', 'alt', 'mod'].includes(k));

                        const keyPressed = event.key.toLowerCase();

                        if (needShift && !event.shiftKey) return false;

                        if (needCtrl && !(event.ctrlKey || event.metaKey)) return false;
                        if (!needCtrl && (event.ctrlKey || event.metaKey)) return false;
                        if (needAlt && !event.altKey) return false;
                        if (!needAlt && event.altKey) return false;

                        if (mainKeys.length && !mainKeys.includes(keyPressed)) return false;

                        return true;
                };

                const setupKeyboardShortcuts = () => {
                        document.addEventListener('keydown', async (event) => {
                                if (isShortcutMatch(event, shortcuts[Shortcut.SEARCH])) {
                                        event.preventDefault();
                                        showSearch.set(!$showSearch);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.NEW_CHAT])) {
                                        event.preventDefault();
                                        document.getElementById('sidebar-new-chat-button')?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.FOCUS_INPUT])) {
                                        event.preventDefault();
                                        document.getElementById('chat-input')?.focus();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.COPY_LAST_CODE_BLOCK])) {
                                        event.preventDefault();
                                        [...document.getElementsByClassName('copy-code-button')]?.at(-1)?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.COPY_LAST_RESPONSE])) {
                                        event.preventDefault();
                                        [...document.getElementsByClassName('copy-response-button')]?.at(-1)?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.TOGGLE_SIDEBAR])) {
                                        event.preventDefault();
                                        showSidebar.set(!$showSidebar);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.DELETE_CHAT])) {
                                        event.preventDefault();
                                        document.getElementById('delete-chat-button')?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.OPEN_SETTINGS])) {
                                        event.preventDefault();
                                        showSettings.set(!$showSettings);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.SHOW_SHORTCUTS])) {
                                        event.preventDefault();
                                        showShortcuts.set(!$showShortcuts);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.CLOSE_MODAL])) {
                                        event.preventDefault();
                                        showSettings.set(false);
                                        showShortcuts.set(false);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.NEW_TEMPORARY_CHAT])) {
                                        event.preventDefault();
                                        if ($user?.role !== 'admin' && $user?.permissions?.chat?.temporary_enforced) {
                                                temporaryChatEnabled.set(true);
                                        } else {
                                                temporaryChatEnabled.set(!$temporaryChatEnabled);
                                        }
                                        await goto('/');
                                        setTimeout(() => {
                                                document.getElementById('new-chat-button')?.click();
                                        }, 0);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.GENERATE_MESSAGE_PAIR])) {
                                        event.preventDefault();
                                        document.getElementById('generate-message-pair-button')?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.REGENERATE_RESPONSE])) {
                                        event.preventDefault();
                                        [...document.getElementsByClassName('regenerate-response-button')]?.at(-1)?.click();
                                }
                        });
                };
                setupKeyboardShortcuts();

                if ($page.url.searchParams.get('temporary-chat') === 'true') {
                        temporaryChatEnabled.set(true);
                }

                await tick();
        });
</script>

<SettingsModal bind:show={$showSettings} />
<ChangelogModal bind:show={$showChangelog} />

<div class="app relative">
        <div
                class="text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900 h-screen max-h-[100dvh] flex flex-row transition-all duration-300 overflow-x-auto"
        >
                <style>
                        :global(.app-content-wrapper) {
                                display: flex;
                                flex: 0 0 100vw;
                                min-width: 100vw;
                                overflow: visible;
                        }
                </style>

                <Sidebar />

                <div class="app-content-wrapper">
                        <slot />
                </div>
        </div>
</div>

<style>
        pre[class*='language-'] {
                position: relative;
                overflow: auto;

                /* make space  */
                margin: 5px 0;
                padding: 1.75rem 0 1.75rem 1rem;
                border-radius: 10px;
        }

        pre[class*='language-'] button {
                position: absolute;
                top: 5px;
                right: 5px;

                font-size: 0.9rem;
                padding: 0.15rem;
                background-color: #828282;

                border: ridge 1px #7b7b7c;
                border-radius: 5px;
                text-shadow: #c4c4c4 0 0 2px;
        }

        pre[class*='language-'] button:hover {
                cursor: pointer;
                background-color: #bcbabb;
        }
</style>
