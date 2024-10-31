<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// function formatDate(dateString: string) {
	// 	return new Date(dateString).toLocaleString();
	// }
	let editorContent = $state({
		html: data.note.html,
		text: data.note.text
	});

	let saveStatus: 'idle' | 'saving' | 'error' = $state('idle');
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let errorMessage = $state('');

	function handleContentChange(event: CustomEvent<{ html: string; text: string }>) {
		const { html, text } = event.detail;
		editorContent = { html, text };
	}

	async function handleSave() {
		if (!editorContent.html.trim()) {
			errorMessage = 'Content cannot be empty';
			saveStatus = 'error';
			return;
		}

		if (browser) {
			try {
				saveStatus = 'saving';
				isSaving = true;

				const formData = new FormData();
				if (data.note && data.note.id) {
					formData.append('id', (data.note?.id ?? '').toString());
				} else {
					throw new Error('Note ID is missing');
				}
				formData.append('html', editorContent.html);
				formData.append('text', editorContent.text);

				const response = await fetch('?/update', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error('Failed to save note');
				}

				// The redirect will happen automatically
			} catch (error) {
				console.error('Error saving note:', error);
				saveStatus = 'error';
				errorMessage = error instanceof Error ? error.message : 'Failed to save note';
			} finally {
				isSaving = false;
			}
		}
	}

	function handleCancel() {
		goto('/notes');
	}

	function handleDeleteNote(event: Event) {
		event.preventDefault(); // Prevent default form submission
		const confirmed = confirm('Are you sure you want to delete this note?');
		if (confirmed) {
			isDeleting = true;
			const formData = new FormData();
			formData.append('id', (data.note?.id ?? '').toString());

			fetch('?/delete', {
				method: 'POST',
				body: formData
			})
				.then((res) => {
					if (res.ok) {
						goto('/notes');
					} else {
						alert('Failed to delete the note');
					}
				})
				.catch((err) => {
					console.error(err);
					alert('Failed to delete the note');
				})
				.finally(() => {
					isDeleting = false;
				});
		}
	}
</script>

<svelte:head>
	{#if browser}
		<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet" />
	{/if}
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Edit Note</h1>

		<div class="flex items-center gap-4">
			{#if saveStatus === 'error'}
				<span class="flex items-center text-red-600">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
					{errorMessage}
				</span>
			{/if}

			<button
				onclick={handleCancel}
				class="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors
                       hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500
                       focus:ring-offset-2"
			>
				Cancel
			</button>

			<button
				onclick={handleSave}
				class="flex items-center gap-2 rounded-md bg-orange-600 px-4
                       py-2 text-white transition-colors duration-200
                       hover:bg-orange-700 focus:outline-none
                       focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isSaving || !editorContent.html.trim()}
			>
				{#if isSaving}
					<svg
						class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Saving...
				{:else}
					Save Note
				{/if}
			</button>
			<!-- delete button -->
			<form onsubmit={handleDeleteNote}>
				<input type="hidden" name="id" value={data.note.id} />
				<button
					onclick={handleDeleteNote}
					class="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white
								  transition-colors duration-200 hover:bg-red-700 focus:outline-none
								  focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed
								  disabled:opacity-50"
					disabled={isDeleting}
				>
					{#if isDeleting}
						<svg
							class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Deleting...
					{:else}
						Delete Note
					{/if}
				</button>
			</form>
		</div>
	</div>

	{#if browser}
		<div class="overflow-hidden rounded-lg bg-white shadow-lg">
			<RichTextEditor
				value={editorContent.html}
				placeholder="Start writing your note..."
				on:change={handleContentChange}
			/>
		</div>
	{/if}
</div>
