import { WEBUI_API_BASE_URL } from '$lib/constants';
import { getTimeRange } from '$lib/utils';

const LOCAL_CHATS_KEY = 'openwebui_local_chats';

function getLocalChats(): Record<string, any> {
        if (typeof window === 'undefined') return {};
        try {
                const data = localStorage.getItem(LOCAL_CHATS_KEY);
                return data ? JSON.parse(data) : {};
        } catch {
                return {};
        }
}

function saveLocalChats(chats: Record<string, any>): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(LOCAL_CHATS_KEY, JSON.stringify(chats));
}

export const createNewChat = async (token: string, chat: any, folderId: string | null) => {
        const id = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);
        
        const newChat = {
                id,
                user_id: 'user',
                title: chat?.title || 'New Chat',
                chat: chat || { messages: [], history: { messages: {}, currentId: null } },
                folder_id: folderId,
                pinned: false,
                archived: false,
                share_id: null,
                created_at: now,
                updated_at: now
        };
        
        const chats = getLocalChats();
        chats[id] = newChat;
        saveLocalChats(chats);
        
        return newChat;
};

export const unarchiveAllChats = async (token: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/unarchive/all`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err.detail;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const importChats = async (token: string, chats: object[]) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/import`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                        chats
                })
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const getChatList = async (
        token: string = '',
        page: number | null = null,
        include_pinned: boolean = false,
        include_folders: boolean = false
) => {
        const chats = getLocalChats();
        const seenIds = new Set<string>();
        let chatList = Object.values(chats)
                .filter((c: any) => {
                        if (!c.id || seenIds.has(c.id)) return false;
                        seenIds.add(c.id);
                        return !c.archived;
                })
                .sort((a: any, b: any) => b.updated_at - a.updated_at);
        
        if (!include_pinned) {
                chatList = chatList.filter((c: any) => !c.pinned);
        }
        
        return chatList.map((chat: any) => ({
                ...chat,
                time_range: getTimeRange(chat.updated_at)
        }));
};

export const getChatListByUserId = async (
        token: string = '',
        userId: string,
        page: number = 1,
        filter?: object
) => {
        let error = null;

        const searchParams = new URLSearchParams();

        searchParams.append('page', `${page}`);

        if (filter) {
                Object.entries(filter).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                                searchParams.append(key, value.toString());
                        }
                });
        }

        const res = await fetch(
                `${WEBUI_API_BASE_URL}/chats/list/user/${userId}?${searchParams.toString()}`,
                {
                        method: 'GET',
                        headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                ...(token && { authorization: `Bearer ${token}` })
                        }
                }
        )
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res.map((chat) => ({
                ...chat,
                time_range: getTimeRange(chat.updated_at)
        }));
};

export const getArchivedChatList = async (
        token: string = '',
        page: number = 1,
        filter?: object
) => {
        let error = null;

        const searchParams = new URLSearchParams();
        searchParams.append('page', `${page}`);

        if (filter) {
                Object.entries(filter).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                                searchParams.append(key, value.toString());
                        }
                });
        }

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/archived?${searchParams.toString()}`, {
                method: 'GET',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res.map((chat) => ({
                ...chat,
                time_range: getTimeRange(chat.updated_at)
        }));
};

export const getAllChats = async (token: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/all`, {
                method: 'GET',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const getChatListBySearchText = async (token: string, text: string, page: number = 1) => {
        let error = null;

        const searchParams = new URLSearchParams();
        searchParams.append('text', text);
        searchParams.append('page', `${page}`);

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/search?${searchParams.toString()}`, {
                method: 'GET',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res.map((chat) => ({
                ...chat,
                time_range: getTimeRange(chat.updated_at)
        }));
};

export const getChatsByFolderId = async (token: string, folderId: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/folder/${folderId}`, {
                method: 'GET',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const getChatListByFolderId = async (token: string, folderId: string, page: number = 1) => {
        let error = null;

        const searchParams = new URLSearchParams();
        if (page !== null) {
                searchParams.append('page', `${page}`);
        }

        const res = await fetch(
                `${WEBUI_API_BASE_URL}/chats/folder/${folderId}/list?${searchParams.toString()}`,
                {
                        method: 'GET',
                        headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                ...(token && { authorization: `Bearer ${token}` })
                        }
                }
        )
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const getAllArchivedChats = async (token: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/all/archived`, {
                method: 'GET',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const getAllUserChats = async (token: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/all/db`, {
                method: 'GET',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const getAllTags = async (token: string) => {
        return [];
};

export const getPinnedChatList = async (token: string = '') => {
        const chats = getLocalChats();
        const seenIds = new Set<string>();
        return Object.values(chats)
                .filter((c: any) => {
                        if (!c.id || seenIds.has(c.id)) return false;
                        seenIds.add(c.id);
                        return c.pinned && !c.archived;
                })
                .sort((a: any, b: any) => b.updated_at - a.updated_at)
                .map((chat: any) => ({
                        ...chat,
                        time_range: getTimeRange(chat.updated_at)
                }));
};

export const getChatListByTagName = async (token: string = '', tagName: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/tags`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({
                        name: tagName
                })
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res.map((chat) => ({
                ...chat,
                time_range: getTimeRange(chat.updated_at)
        }));
};

export const getChatById = async (token: string, id: string) => {
        const chats = getLocalChats();
        return chats[id] || null;
};

export const getChatByShareId = async (token: string, share_id: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/share/${share_id}`, {
                method: 'GET',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const getChatPinnedStatusById = async (token: string, id: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/pinned`, {
                method: 'GET',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        if ('detail' in err) {
                                error = err.detail;
                        } else {
                                error = err;
                        }

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const toggleChatPinnedStatusById = async (token: string, id: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/pin`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        if ('detail' in err) {
                                error = err.detail;
                        } else {
                                error = err;
                        }

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const cloneChatById = async (token: string, id: string, title?: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/clone`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({
                        ...(title && { title: title })
                })
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        if ('detail' in err) {
                                error = err.detail;
                        } else {
                                error = err;
                        }

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const cloneSharedChatById = async (token: string, id: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/clone/shared`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        if ('detail' in err) {
                                error = err.detail;
                        } else {
                                error = err;
                        }

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const shareChatById = async (token: string, id: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/share`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const updateChatFolderIdById = async (token: string, id: string, folderId?: string) => {
        const chats = getLocalChats();
        if (chats[id]) {
                chats[id].folder_id = folderId || null;
                chats[id].updated_at = Math.floor(Date.now() / 1000);
                saveLocalChats(chats);
                return chats[id];
        }
        return null;
};

export const archiveChatById = async (token: string, id: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/archive`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const deleteSharedChatById = async (token: string, id: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/share`, {
                method: 'DELETE',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const updateChatById = async (token: string, id: string, chat: any) => {
        const chats = getLocalChats();
        if (chats[id]) {
                chats[id] = {
                        ...chats[id],
                        chat: chat,
                        updated_at: Math.floor(Date.now() / 1000)
                };
                saveLocalChats(chats);
                return chats[id];
        }
        return null;
};

export const deleteChatById = async (token: string, id: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}`, {
                method: 'DELETE',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err.detail;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const getTagsById = async (token: string, id: string) => {
        return [];
};

export const addTagById = async (token: string, id: string, tagName: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/tags`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({
                        name: tagName
                })
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err.detail;
                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const deleteTagById = async (token: string, id: string, tagName: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/tags`, {
                method: 'DELETE',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({
                        name: tagName
                })
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};
export const deleteTagsById = async (token: string, id: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/tags/all`, {
                method: 'DELETE',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const deleteAllChats = async (token: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/`, {
                method: 'DELETE',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err.detail;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};

export const archiveAllChats = async (token: string) => {
        let error = null;

        const res = await fetch(`${WEBUI_API_BASE_URL}/chats/archive/all`, {
                method: 'POST',
                headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(token && { authorization: `Bearer ${token}` })
                }
        })
                .then(async (res) => {
                        if (!res.ok) throw await res.json();
                        return res.json();
                })
                .then((json) => {
                        return json;
                })
                .catch((err) => {
                        error = err.detail;

                        console.error(err);
                        return null;
                });

        if (error) {
                throw error;
        }

        return res;
};
