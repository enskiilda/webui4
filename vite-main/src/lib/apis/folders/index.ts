const STORAGE_KEY = 'openwebui_folders';

type FolderForm = {
	name?: string;
	data?: Record<string, any>;
	meta?: Record<string, any>;
	parent_id?: string;
};

type Folder = {
	id: string;
	name: string;
	data: Record<string, any>;
	meta: Record<string, any>;
	parent_id?: string;
	is_expanded: boolean;
	items: { chat_ids: string[]; file_ids: string[] };
	created_at: number;
	updated_at: number;
};

function getFoldersFromStorage(): Folder[] {
	if (typeof window === 'undefined') return [];
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

function saveFoldersToStorage(folders: Folder[]): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
}

function generateId(): string {
	return 'folder-' + crypto.randomUUID();
}

export const createNewFolder = async (_token: string, folderForm: FolderForm): Promise<Folder> => {
	const folders = getFoldersFromStorage();
	const now = Date.now() / 1000;
	
	const newFolder: Folder = {
		id: generateId(),
		name: folderForm.name || 'New Folder',
		data: folderForm.data || {},
		meta: folderForm.meta || {},
		parent_id: folderForm.parent_id,
		is_expanded: true,
		items: { chat_ids: [], file_ids: [] },
		created_at: now,
		updated_at: now
	};
	
	folders.push(newFolder);
	saveFoldersToStorage(folders);
	
	return newFolder;
};

export const getFolders = async (_token: string = ''): Promise<Folder[]> => {
	return getFoldersFromStorage();
};

export const getFolderById = async (_token: string, id: string): Promise<Folder | null> => {
	const folders = getFoldersFromStorage();
	return folders.find(f => f.id === id) || null;
};

export const updateFolderById = async (_token: string, id: string, folderForm: FolderForm): Promise<Folder | null> => {
	const folders = getFoldersFromStorage();
	const index = folders.findIndex(f => f.id === id);
	
	if (index === -1) return null;
	
	folders[index] = {
		...folders[index],
		...(folderForm.name !== undefined && { name: folderForm.name }),
		...(folderForm.data !== undefined && { data: folderForm.data }),
		...(folderForm.meta !== undefined && { meta: folderForm.meta }),
		updated_at: Date.now() / 1000
	};
	
	saveFoldersToStorage(folders);
	return folders[index];
};

export const updateFolderIsExpandedById = async (
	_token: string,
	id: string,
	isExpanded: boolean
): Promise<Folder | null> => {
	const folders = getFoldersFromStorage();
	const index = folders.findIndex(f => f.id === id);
	
	if (index === -1) return null;
	
	folders[index].is_expanded = isExpanded;
	folders[index].updated_at = Date.now() / 1000;
	
	saveFoldersToStorage(folders);
	return folders[index];
};

export const updateFolderParentIdById = async (_token: string, id: string, parentId?: string): Promise<Folder | null> => {
	const folders = getFoldersFromStorage();
	const index = folders.findIndex(f => f.id === id);
	
	if (index === -1) return null;
	
	folders[index].parent_id = parentId;
	folders[index].updated_at = Date.now() / 1000;
	
	saveFoldersToStorage(folders);
	return folders[index];
};

type FolderItems = {
	chat_ids: string[];
	file_ids: string[];
};

export const updateFolderItemsById = async (_token: string, id: string, items: FolderItems): Promise<Folder | null> => {
	const folders = getFoldersFromStorage();
	const index = folders.findIndex(f => f.id === id);
	
	if (index === -1) return null;
	
	folders[index].items = items;
	folders[index].updated_at = Date.now() / 1000;
	
	saveFoldersToStorage(folders);
	return folders[index];
};

export const deleteFolderById = async (_token: string, id: string, _deleteContents: boolean): Promise<boolean> => {
	const folders = getFoldersFromStorage();
	const filtered = folders.filter(f => f.id !== id);
	
	if (filtered.length === folders.length) return false;
	
	saveFoldersToStorage(filtered);
	return true;
};
