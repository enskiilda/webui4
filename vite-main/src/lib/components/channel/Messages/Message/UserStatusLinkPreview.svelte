<script lang="ts">
        import { getContext, onMount } from 'svelte';
        import { LinkPreview } from 'bits-ui';

        const i18n = getContext('i18n');

        import UserStatus from './UserStatus.svelte';

        export let id = null;

        export let side = 'top';
        export let align = 'start';
        export let sideOffset = 6;

        let user = null;
</script>

{#if user}
        <LinkPreview.Content
                class="w-full max-w-[260px] rounded-2xl border border-gray-100  dark:border-gray-800 z-[99999] bg-white dark:bg-gray-850 dark:text-white shadow-lg transition"
                {side}
                {align}
                {sideOffset}
        >
                <UserStatus {user} />
        </LinkPreview.Content>
{/if}
