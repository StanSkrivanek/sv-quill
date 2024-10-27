<script lang="ts">
	import Navigation from '../lib/components/Navigation.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<Navigation />
	<main>
		{@render children()}
	</main>
</div>
