<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}
	const initItemsPerPage = 5;
	let { data }: Props = $props();
	console.log("🚀 ~ data:", data.recentNotes[0])


	let currentPage = $state(data.currentPage);
	let itemsPerPage = $state(data.itemsPerPage || initItemsPerPage.toString());

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
	}

	function handleCreateNew() {
		goto('/notes/new');
	}

	function handleReadNote(id: number) {
		goto(`/notes/${id}`);
	}

	function changePage(page: number) {
		if (page < 1 || page > data.totalPages) return; // Prevent invalid page numbers
		currentPage = page;
		goto(`/notes?page=${page}&itemsPerPage=${itemsPerPage}`);
	}

	function changeItemsPerPage(event: Event) {
		itemsPerPage = (event.target as HTMLSelectElement).value;
		currentPage = 1; // Reset to first page when items per page changes
		goto(`/notes?page=1&itemsPerPage=${itemsPerPage}`);
	}
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-800">My Notes</h1>

		<button
			onclick={handleCreateNew}
			class="flex items-center gap-2 rounded-md bg-green-500 px-4
             py-2 text-white hover:bg-green-600 focus:outline-none
             focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
			New Note
		</button>
	</div>

	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<label for="itemsPerPage" class="text-gray-700">Items per page:</label>
			<select
				id="itemsPerPage"
				value={initItemsPerPage.toString() ?? itemsPerPage }			
				onchange={changeItemsPerPage}
				class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
			>
				<option value="3">3</option>
				<option value="5">5</option>
				<option value="10">10</option>
				<option value="25">25</option>
			</select>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={() => changePage(currentPage - 1)}
				disabled={currentPage === 1}
				class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
			>
				Previous
			</button>
			<span class="text-gray-700">Page {currentPage} of {data.totalPages}</span>
			<button
				onclick={() => changePage(currentPage + 1)}
				disabled={currentPage === data.totalPages}
				class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
			>
				Next
			</button>
		</div>
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
					<div class=" items-start justify-between">
						<div class="flex-1">
							<h2 class=" pb-1 mb-3 text-xl font-semibold text-orange-600 border-b border-gray-200">
								{note.title}
							</h2>
							<p class="mb-4 text-gray-600">
								{note.excerpt}
							</p>
						</div>
						<div class="flex items-end justify-between gap-2">
							<p class="text-sm text-gray-500">
								Created: {formatDate(note.created_at ?? '')}
							</p>
							<button
								onclick={() => note.id !== undefined && handleReadNote(note.id)}
								class="ml-4 rounded-md bg-blue-100 px-4 py-2 text-sm font-medium
								 text-blue-700 transition-colors hover:bg-blue-200 hover:text-blue-600
								 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
							>
								Read
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
