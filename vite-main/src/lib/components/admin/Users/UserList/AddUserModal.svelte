<script>
	export let show = false;
	export let onSubmit = () => {};
</script>

{#if show}
	<div class="modal">
		<div class="modal-content">
			<slot />
		</div>
	</div>
{/if}
