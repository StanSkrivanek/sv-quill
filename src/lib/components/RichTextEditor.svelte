<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	// Event dispatcher for changes
	import { createEventDispatcher } from 'svelte';

	// Props

	interface Props {
		noteContent?: string;
		title?: string;
		placeholder?: string;
		readonly?: boolean;
		height?: string;
	}

	let {
		noteContent = '',
		title = '',
		placeholder = 'Start writing your note...',
		readonly = false,
		height = '400px'
	}: Props = $props();
	const dispatch = createEventDispatcher();

	// Editor references
	let Quill: any;
	let DOMPurify: any;
	let quill: any;
	let editorElement = $state();
	let isEditorReady = false;

	// Quill configuration
	const toolbarOptions = [
		[{ font: [] }],
		[{ header: [1, 2, 3, 4, 5, 6, false] }],
		['bold', 'italic', 'underline', 'strike'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		['blockquote', 'code-block'],
		[{ header: 1 }, { header: 2 }, { header: 3 }, { header: 4 }],
		[{ color: [] }, { background: [] }],
		[{ script: 'sub' }, { script: 'super' }],
		[{ indent: '-1' }, { indent: '+1' }],
		[{ direction: 'rtl' }],
		// [{ 'size': ['small', false, 'large', 'huge'] }],
		[{ align: [] }],
		['link', 'image', 'video'],
		['clean']
	];
	// Convert image to base64
	async function convertToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	}
	// Image upload handler
	const imageHandler = () => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = async () => {
			const file = input.files?.[0];
			if (file) {
				try {
					// Check file size (limit to 200KB)
					const maxSizeKB = 200;
					if (file.size > maxSizeKB * 1024) {
						showPopup(`Image size should not exceed ${maxSizeKB}KB`);
						return;
					}

					// Check image dimensions (limit to 960x960)
					const maxWidth = 1280;
					const maxHeight = 960;
					const image = new Image();
					image.src = URL.createObjectURL(file);
					image.onload = () => {
						if (image.width > maxWidth || image.height > maxHeight) {
							showPopup(`Image dimensions should not exceed ${maxWidth}x${maxHeight}px`);
							return;
						}
						convertAndInsertImage(file);
					};
				} catch (error) {
					console.error('Error uploading image:', error);
				}
			}
		};
	};

	// Convert image to base64 and insert into editor
	async function convertAndInsertImage(file: File) {
		const imageUrl = await convertToBase64(file);
		const range = quill.getSelection();
		quill.insertEmbed(range.index, 'image', imageUrl);
	}

	// Show popup
	function showPopup(message: string) {
		const popup = document.createElement('div');
		popup.className =
			'popup fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50';

		const popupContent = document.createElement('div');
		popupContent.className = 'bg-white p-6 rounded-lg shadow-lg text-center';

		const messageText = document.createElement('p');
		messageText.innerText = message;

		const closeButton = document.createElement('button');
		closeButton.className = 'mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-00';
		closeButton.innerText = 'Close';
		closeButton.onclick = () => popup.remove();

		popupContent.appendChild(messageText);
		popupContent.appendChild(closeButton);
		popup.appendChild(popupContent);
		document.body.appendChild(popup);

		setTimeout(() => {
			popup.remove();
		}, 6000); // Auto-close after 3 seconds
	}

	onMount(async () => {
		if (browser) {
			// Dynamically import Quill and DOMPurify only on the client side
			const [quillModule, domPurifyModule] = await Promise.all([
				import('quill'),
				import('dompurify')
			]);
			// Get the default export from the modules
			Quill = quillModule.default;
			DOMPurify = domPurifyModule.default;

			// Initialize Quill
			quill = new Quill(editorElement, {
				modules: {
					toolbar: {
						container: toolbarOptions,
						handlers: {
							image: imageHandler
						}
					}
				},
				placeholder,
				readOnly: readonly,
				theme: 'snow'
			});

			// Set initial content
			if (noteContent) {
				quill.root.innerHTML = DOMPurify.sanitize(noteContent);
			}

			// Handle content changes
			quill.on('text-change', () => {
				const content = quill.root.innerHTML;

				const sanitizedContent = DOMPurify.sanitize(content, {
					ALLOWED_TAGS: [
						'p',
						'br',
						'strong',
						'em',
						'u',
						's',
						'h1',
						'h2',
						'h3',
						'h4',
						'h5',
						'h6',
						'ol',
						'ul',
						'li',
						'blockquote',
						'pre',
						'code',
						'a',
						'img',
						'video',
						'span',
						'sub',
						'super',
						'div'
					],
					ALLOWED_ATTR: [
						'href',
						'src',
						'alt',
						'class',
						'style',
						'target',
						'controls',
						'width',
						'height'
					],
					ALLOWED_STYLES: [
						'color',
						'background-color',
						'text-align',
						'font-size',
						'font-family',
						'margin',
						'margin-left',
						'padding'
					]
				});

				dispatch('change', {
					title,
					html: sanitizedContent,
					text: quill.getText()
				});
			});

			isEditorReady = true;
		}
	});

	onDestroy(() => {
		if (quill) {
			quill = null;
		}
	});
</script>

{#if browser}
	<div class="rich-text-editor" style="height: {height}">
		<input
			type="text"
			bind:value={title}
			placeholder="Enter note title"
			oninput={() =>
				dispatch('change', { title, html: quill.root.innerHTML, text: quill.getText() })}
		/>
		<div bind:this={editorElement}></div>
	</div>
{/if}

<style>
	.rich-text-editor {
		/* border: 1px solid #ccc; */
		border-radius: 0.25rem;
		overflow: hidden;
		min-height: 80svh;
	}

	.rich-text-editor :global(.ql-container) {
		height: calc(100% - 70px);
		border: none;
	}

	/* Add some basic styling for the toolbar */
	.rich-text-editor :global(.ql-toolbar) {
		border-bottom: 1px solid #ccc;
		background-color: #f8f8f8;
		z-index: 1;
	}

	/* add hover to active and hovered buttons*/
	.rich-text-editor :global([type='button']) {
		width: 24px;
		height: 24px;
	}
	.rich-text-editor :global([type='button']:hover) {
		background-color: #f0f0f0;
		color: red !important;
	}

	/* Style for the editor area */
	.rich-text-editor :global(.ql-editor) {
		min-height: 100%;
		font-size: 16px;
		line-height: 1.5;
	}

	/* Style for the title input */
	.rich-text-editor input[type='text'] {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		margin-bottom: 0.5rem;
		box-sizing: border-box;
	}
</style>
