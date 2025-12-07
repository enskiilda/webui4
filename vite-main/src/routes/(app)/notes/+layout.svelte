<script lang="ts">
        import { onMount, getContext } from 'svelte';
        import { WEBUI_NAME, showSidebar, functions, config, user, showArchivedChats } from '$lib/stores';
        import { goto } from '$app/navigation';

        const i18n = getContext('i18n');

        onMount(async () => {
                if (
                        !(
                                ($config?.features?.enable_notes ?? false) &&
                                ($user?.role === 'admin' || ($user?.permissions?.features?.notes ?? true))
                        )
                ) {
                        goto('/');
                }
        });
</script>

<svelte:head>
        <title>
                {$i18n.t('Notes')} • {$WEBUI_NAME}
        </title>
</svelte:head>

<slot />
