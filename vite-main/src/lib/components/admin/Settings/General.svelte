<script lang="ts">
	import DOMPurify from 'dompurify';

	import { getVersionUpdates, getWebhookUrl, updateWebhookUrl } from '$lib/apis';
	import { getGroups } from '$lib/apis/groups';
	import Switch from '$lib/components/common/Switch.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import { WEBUI_BUILD_HASH, WEBUI_VERSION } from '$lib/constants';
	import { config, showChangelog } from '$lib/stores';
	import { compareVersion } from '$lib/utils';
	import { onMount, getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Textarea from '$lib/components/common/Textarea.svelte';

	const i18n = getContext('i18n');

	export let saveHandler: Function;

	let updateAvailable = null;
	let version = {
		current: '',
		latest: ''
	};

	let webhookUrl = '';
	let groups = [];

	const checkForVersionUpdates = async () => {
		updateAvailable = null;
		version = await getVersionUpdates(localStorage.token).catch((error) => {
			return {
				current: WEBUI_VERSION,
				latest: WEBUI_VERSION
			};
		});

		console.info(version);

		updateAvailable = compareVersion(version.latest, version.current);
		console.info(updateAvailable);
	};

	const updateHandler = async () => {
		webhookUrl = await updateWebhookUrl(localStorage.token, webhookUrl);
		saveHandler();
	};

	onMount(async () => {
		if ($config?.features?.enable_version_update_check) {
			checkForVersionUpdates();
		}

		await Promise.all([
			(async () => {
				webhookUrl = await getWebhookUrl(localStorage.token);
			})(),
			(async () => {
				groups = await getGroups(localStorage.token);
			})()
		]);
	});
</script>

<form
	class="flex flex-col h-full justify-between space-y-3 text-sm"
	on:submit|preventDefault={async () => {
		updateHandler();
	}}
>
	<div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full">
		<div class="">
			<div class="mb-3.5">
				<div class=" mt-0.5 mb-2.5 text-base font-medium">{$i18n.t('General')}</div>

				<hr class=" border-gray-100 dark:border-gray-850 my-2" />

				<div class="mb-2.5">
					<div class=" mb-1 text-xs font-medium flex space-x-2 items-center">
						<div>
							{$i18n.t('Version')}
						</div>
					</div>
					<div class="flex w-full justify-between items-center">
						<div class="flex flex-col text-xs text-gray-700 dark:text-gray-200">
							<div class="flex gap-1">
								<Tooltip content="">
									v{WEBUI_VERSION}
								</Tooltip>

								{#if $config?.features?.enable_version_update_check}
									<a
										href="https://github.com/open-webui/open-webui/releases/tag/v{version.latest}"
										target="_blank"
									>
										{updateAvailable === null
											? $i18n.t('Checking for updates...')
											: updateAvailable
												? `(v${version.latest} ${$i18n.t('available!')})`
												: $i18n.t('(latest)')}
									</a>
								{/if}
							</div>

							<button
								class=" underline flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500"
								type="button"
								on:click={() => {
									showChangelog.set(true);
								}}
							>
								<div>{$i18n.t("See what's new")}</div>
							</button>
						</div>

						{#if $config?.features?.enable_version_update_check}
							<button
								class=" text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-lg font-medium"
								type="button"
								on:click={() => {
									checkForVersionUpdates();
								}}
							>
								{$i18n.t('Check for updates')}
							</button>
						{/if}
					</div>
				</div>

				<div class="mb-2.5">
					<div class="flex w-full justify-between items-center">
						<div class="text-xs pr-2">
							<div class="">
								{$i18n.t('Help')}
							</div>
							<div class=" text-xs text-gray-500">
								{$i18n.t('Discover how to use Open WebUI and seek support from the community.')}
							</div>
						</div>

						<a
							class="flex-shrink-0 text-xs font-medium underline"
							href="https://docs.openwebui.com/"
							target="_blank"
						>
							{$i18n.t('Documentation')}
						</a>
					</div>

					<div class="mt-1">
						<div class="flex space-x-1">
							<a href="https://discord.gg/5rJgQTnV4s" target="_blank">
								<img
									alt="Discord"
									src="https://img.shields.io/badge/Discord-Open_WebUI-blue?logo=discord&logoColor=white"
								/>
							</a>

							<a href="https://twitter.com/OpenWebUI" target="_blank">
								<img
									alt="X (formerly Twitter) Follow"
									src="https://img.shields.io/twitter/follow/OpenWebUI"
								/>
							</a>

							<a href="https://github.com/open-webui/open-webui" target="_blank">
								<img
									alt="Github Repo"
									src="https://img.shields.io/github/stars/open-webui/open-webui?style=social&label=Star us on Github"
								/>
							</a>
						</div>
					</div>
				</div>

				<div class="mb-2.5">
					<div class="flex w-full justify-between items-center">
						<div class="text-xs pr-2">
							<div class="">
								{$i18n.t('License')}
							</div>

							{#if $config?.license_metadata}
								<a
									href="https://docs.openwebui.com/enterprise"
									target="_blank"
									class="text-gray-500 mt-0.5"
								>
									<span class=" capitalize text-black dark:text-white"
										>{$config?.license_metadata?.type}
										license</span
									>
									registered to
									<span class=" capitalize text-black dark:text-white"
										>{$config?.license_metadata?.organization_name}</span
									>
									for
									<span class=" font-medium text-black dark:text-white"
										>{$config?.license_metadata?.seats ?? 'Unlimited'} users.</span
									>
								</a>
								{#if $config?.license_metadata?.html}
									<div class="mt-0.5">
										{@html DOMPurify.sanitize($config?.license_metadata?.html)}
									</div>
								{/if}
							{:else}
								<a
									class=" text-xs hover:underline"
									href="https://docs.openwebui.com/enterprise"
									target="_blank"
								>
									<span class="text-gray-500">
										{$i18n.t(
											'Upgrade to a licensed plan for enhanced capabilities, including custom theming and branding, and dedicated support.'
										)}
									</span>
								</a>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<div class="mb-3">
				<div class=" mt-0.5 mb-2.5 text-base font-medium">{$i18n.t('Webhook')}</div>

				<hr class=" border-gray-100 dark:border-gray-850 my-2" />

				<div class="mb-2.5">
					<div class="flex flex-col w-full">
						<div class=" mb-1 text-xs font-medium">{$i18n.t('Webhook URL')}</div>

						<div class="flex-1">
							<input
								class="w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden"
								type="text"
								placeholder={$i18n.t('Enter webhook URL')}
								bind:value={webhookUrl}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="flex justify-end pt-3 text-sm font-medium">
		<button
			class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full"
			type="submit"
		>
			{$i18n.t('Save')}
		</button>
	</div>
</form>
