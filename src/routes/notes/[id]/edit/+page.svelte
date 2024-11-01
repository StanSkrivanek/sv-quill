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
		title: data.note.title,
		html: data.note.html,
		text: data.note.text
	});

	let saveStatus: 'idle' | 'saving' | 'error' = $state('idle');
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let errorMessage = $state('');

	let showModal = $state(false);
	let modalMessage = $state('');
	let modalAction: (() => void) | null = null;

	function handleContentChange(event: CustomEvent<{ title: string; html: string; text: string }>) {
		const { title, html, text } = event.detail;
		editorContent = { title, html, text };
	}

	async function handleSave() {
		if (editorContent.text.trim() === '' || editorContent.html === '<p></p>') {
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

				formData.append('title', editorContent.title);
				formData.append('html', editorContent.html);
				formData.append('text', editorContent.text);

				const response = await fetch('?/update', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error('Failed to save note');
				}
				// Redirect to the list of notes
				goto('/notes');
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

	function openModal(message: string, action: () => void) {
		modalMessage = message;
		modalAction = action;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		modalMessage = '';
		modalAction = null;
	}

	function handleDeleteNote() {
		openModal('Are you sure you want to delete this note?', async () => {
			isDeleting = true;
			const formData = new FormData();
			formData.append('id', (data.note?.id ?? '').toString());

			try {
				const res = await fetch('?/delete', {
					method: 'POST',
					body: formData
				});
				if (res.ok) {
					goto('/notes');
				} else {
					openModal('Failed to delete the note', () => closeModal());
				}
			} catch (err) {
				console.error(err);
				openModal('Failed to delete the note', () => closeModal());
			} finally {
				isDeleting = false;
			}
		});
	}
</script>

<svelte:head>
	{#if browser}
		<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet" />
	{/if}
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
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

			<button
				onclick={handleDeleteNote}
				class="ml-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium
						text-red-700 transition-colors hover:bg-red-200 hover:text-red-800
							focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
				disabled={isDeleting}
			>
				{#if isDeleting}
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
					Deleting...
				{:else}
					Delete Note
				{/if}
			</button>
		</div>
	</div>

	{#if browser}
		<div class="overflow-hidden rounded-lg bg-white shadow-lg">
			<RichTextEditor
				noteContent={editorContent.html}
				title={editorContent.title}
				placeholder="Start writing your note..."
				onChange={(details) => handleContentChange(new CustomEvent('change', { detail: details }))}
			/>
		</div>
	{/if}
</div>

<!-- Modal Component -->
{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
			<p class="mb-4">{modalMessage}</p>
			<div class="flex justify-end gap-4">
				<button
					onclick={closeModal}
					class="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors
						   hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500
						   focus:ring-offset-2"
				>
					Cancel
				</button>
				<button
					onclick={() => {
						modalAction?.();
						closeModal();
					}}
					class="ml-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium
							text-red-700 transition-colors hover:bg-red-200 hover:text-red-800
							focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}
