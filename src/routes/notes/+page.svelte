<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
	}

	function handleCreateNew() {
		goto('/notes/new');
	}

	function handleReadNote(id: number) {
		goto(`/notes/${id}`);
	}
</script>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-2xl font-bold">My Notes</h1>

		<button
			onclick={handleCreateNew}
			class="flex items-center gap-2 rounded-md bg-orange-600 px-4
             py-2 text-white hover:bg-orange-700 focus:outline-none
             focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
					clip-rule="evenodd"
				/>
			</svg>
			Create New Note
		</button>
	</div>

	{#if data.recentNotes.length === 0}
		<div class="rounded-lg bg-gray-50 py-12 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mx-auto h-12 w-12 text-gray-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900">No notes</h3>
			<p class="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
		</div>
	{:else}
		<div class="grid gap-6">
			{#each data.recentNotes as note}
				<div class="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<h2 class="mb-2 text-xl font-semibold text-gray-900">
								{note.title}
							</h2>
							<p class="mb-4 text-gray-600">
								{note.excerpt}
							</p>
							<p class="text-sm text-gray-500">
								Created: {formatDate(note.created_at ?? '')}
							</p>
						</div>
						<button
							onclick={() => note.id !== undefined && handleReadNote(note.id)}
							class="ml-4 rounded-md bg-orange-100 px-4 py-2 text-sm font-medium
					 text-orange-700 transition-colors hover:bg-green-200 hover:text-green-700
					 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
						>
							Read
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
