<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';
	import { ALLOWED_OPTIONS, IMAGE_CONSTRAINTS, INITIAL_TOOL_STATE } from './config';
	import type { Props, ToolKey, ToolsState } from './types';

	let {
		noteContent = '',
		title = '',
		placeholder = 'Start writing your note...',
		readonly = false,
		height = '400px',
		onChange = () => undefined
	}: Props = $props();

	let Quill: any;
	let DOMPurify: any;
	let quill: any;
	let editorElement: HTMLElement | undefined = $state();
	let isEditorReady = false;
	let isSettingsModalOpen = $state(false);
	let mounted = $state(false);
	let isDialogOpen = $state(false);
	let popupMessage = $state('');
	// Storage utilities
	const STORAGE_KEY = 'quill-toolbar-settings';
	const storedToolState = loadToolbarSettings();

	let tools: any[] = [];


	// ---------------------- QUILL Toolbar CONFIGURATION ----------------------

	// Create derived state for tool settings
	const toolState = $state<ToolsState>({
		...INITIAL_TOOL_STATE,
		...storedToolState
	});

	// Function to toggle tool visibility
	function toggleToolVisibility(key: keyof ToolsState) {
		toolState[key].visible = !toolState[key].visible;
		// Save the updated settings to localStorage
		saveToolbarSettings(toolState);
	}

	// Update tools when toolState changes
	$effect(() => {
		tools = generateToolbarOptions();
		// $inspect('🚀 ~ TOOLS:', tools);
	});

	// ---------------------- LOCAL STORE FOR TOOLBAR SETTING STATE ----------------------

	// save toolbar settings to local storage
	function saveToolbarSettings(settings: ToolsState) {
		if (browser) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
			} catch (e) {
				console.warn('Failed to save toolbar settings:', e);
			}
		}
	}

	// Load toolbar settings from local storage
	function loadToolbarSettings(): Partial<ToolsState> {
		if (browser) {
			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				return stored ? JSON.parse(stored) : {};
			} catch (e) {
				console.warn('Failed to load toolbar settings:', e);
				return {};
			}
		}
		return {};
	}

	// Add function to handle Quill initialization
	async function initializeQuill() {
		try {
			if (!editorElement) {
				console.error('Editor element not found');
				return;
			}

			const [quillModule, domPurifyModule] = await Promise.all([
				import('quill'),
				import('dompurify')
			]);

			if (!mounted) return;

			Quill = quillModule.default;
			DOMPurify = domPurifyModule.default;

			// Store current content if quill exists
			const currentContent = quill?.root?.innerHTML || noteContent;

			// Remove old toolbar and destroy existing instance
			const oldToolbar = editorElement.previousSibling;
			if (oldToolbar && (oldToolbar as HTMLElement).className?.includes('ql-toolbar')) {
				oldToolbar.remove();
			}

			if (quill) {
				quill.off('text-change');
				quill = null;
			}

			// Clear the editor element
			editorElement.innerHTML = '';

			// Create new Quill instance
			quill = new Quill(editorElement, {
				modules: {
					toolbar: {
						container: [
							...generateToolbarOptions(),
							[{ settings: 'Settings' }] // Settings button
						],
						handlers: {
							image: imageHandler,
							settings: toggleSettings
						}
					}
				},
				placeholder,
				readOnly: readonly,
				theme: 'snow'
			});

			// Restore content after a brief delay to ensure proper initialization
			await tick();
			if (currentContent && quill) {
				quill.root.innerHTML = DOMPurify.sanitize(currentContent, ALLOWED_OPTIONS);
			}

			isEditorReady = true;

			quill.on('text-change', () => {
				const html = quill.root.innerHTML;
				const cleanHtml = DOMPurify.sanitize(html, ALLOWED_OPTIONS);
				const text = quill.getText();
				onChange({ title, html: cleanHtml, text });
			});
		} catch (error) {
			console.error('Failed to initialize Quill:', error);
			isEditorReady = false;
			quill = null;
		}
	}
	// Reinitialize Quill when settings change
	function reinitializeQuill() {
		if (!quill || !Quill || !DOMPurify || !editorElement) return;

		// Save current content and selection
		const content = quill.getContents();
		const selection = quill.getSelection();

		// Clean up old instance
		quill.off('text-change');

		// Remove existing toolbar if any
		const oldToolbar = document.querySelector('.ql-toolbar');
		if (oldToolbar) {
			oldToolbar.remove();
		}

		// Reset editor element
		editorElement.innerHTML = '';

		// Initialize new Quill instance with proper structure
		initializeQuill();

		// Restore content and selection
		quill.setContents(content);
		if (selection) {
			quill.setSelection(selection);
		}

		// Reattach event handlers
		quill.on('text-change', () => {
			const dirtyHtml = quill.root.innerHTML;
			const cleanHtml = DOMPurify.sanitize(dirtyHtml, ALLOWED_OPTIONS);
			const text = quill.getText();
			onChange({ title, html: cleanHtml, text });
		});
	}
	// Initialize Quill on mount
	onMount(() => {
		if (!browser) return;

		mounted = true;
		let initializationTimer: number;

		if (editorElement && tools.length > 0) {
			// Delay initialization slightly to ensure DOM is ready
			initializationTimer = window.setTimeout(() => {
				initializeQuill();
			}, 100);
		}

		return () => {
			mounted = false;
			if (initializationTimer) {
				window.clearTimeout(initializationTimer);
			}
			if (quill) {
				quill.off('text-change');
				quill = null;
			}
		};
	});

	// Function to generate toolbar options
	function generateToolbarOptions() {
		return [
			...(toolState.font.visible ? [[{ font: [] }]] : []),
			...(toolState.header.visible ? [[{ header: [1, 2, 3, 4, 5, 6, false] }]] : []),
			[
				...(toolState.bold.visible ? ['bold'] : []),
				...(toolState.italic.visible ? ['italic'] : []),
				...(toolState.underline.visible ? ['underline'] : []),
				...(toolState.strike.visible ? ['strike'] : [])
			].filter((tool) => tool),
			...(toolState.list.visible ? [[{ list: 'ordered' }, { list: 'bullet' }]] : []),
			[
				...(toolState.blockquote.visible ? ['blockquote'] : []),
				...(toolState.codeBlock.visible ? ['code-block'] : [])
			].filter((tool) => tool),
			[
				...(toolState.color.visible ? [{ color: [] }] : []),
				...(toolState.background.visible ? [{ background: [] }] : [])
			].filter((tool) => Object.keys(tool).length),
			...(toolState.script.visible ? [[{ script: 'sub' }, { script: 'super' }]] : []),
			...(toolState.indent.visible ? [[{ indent: '-1' }, { indent: '+1' }]] : []),
			...(toolState.direction.visible ? [[{ direction: 'rtl' }]] : []),
			...(toolState.align.visible ? [[{ align: [] }]] : []),
			[
				...(toolState.link.visible ? ['link'] : []),
				...(toolState.image.visible ? ['image'] : []),
				...(toolState.video.visible ? ['video'] : [])
			].filter((tool) => tool),
			...(toolState.clean.visible ? [['clean']] : [])
		].filter((group) => Array.isArray(group) && group.length > 0);
	}

	//  Run reinitializeQuill() on dialog Close
	async function toggleSettings() {
		isSettingsModalOpen = !isSettingsModalOpen;
		if (!isSettingsModalOpen) {
			await tick();
			reinitializeQuill();
		}
	}

	// ---------------------- IMAGE HANDLER ----------------------

	const imageHandler = async () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';

		try {
			let isLoading = true;

			input.onchange = async () => {
				const file = input.files?.[0];
				if (!file) return;

				// Validate file type
				if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type)) {
					showError('Please upload a valid image file (JPEG, PNG, or GIF)');
					return;
				}

				// Validate file size
				if (file.size > IMAGE_CONSTRAINTS.maxSizeKB * 1024) {
					showError(`Image size should not exceed ${IMAGE_CONSTRAINTS.maxSizeKB}KB`);
					return;
				}

				const objectUrl = URL.createObjectURL(file);
				const image = new Image();

				try {
					await new Promise((resolve, reject) => {
						image.onload = resolve;
						image.onerror = reject;
						image.src = objectUrl;
					});

					// Validate dimensions
					if (
						image.width > IMAGE_CONSTRAINTS.maxWidth ||
						image.height > IMAGE_CONSTRAINTS.maxHeight
					) {
						showError(
							`Image dimensions should not exceed ${IMAGE_CONSTRAINTS.maxWidth}x${IMAGE_CONSTRAINTS.maxHeight}px`
						);
						return;
					}

					await convertAndInsertImage(file);
				} catch (error) {
					showError('Failed to process image');
					console.error('Image processing error:', error);
				} finally {
					URL.revokeObjectURL(objectUrl);
					isLoading = false;
				}
			};

			input.click();
		} catch (error) {
			showError('Failed to handle image upload');
			console.error('Image handler error:', error);
		}
	};

	const showError = (message: string) => {
		isDialogOpen = true;
		popupMessage = message;
	};

	async function convertToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	}

	async function convertAndInsertImage(file: File) {
		const imageUrl = await convertToBase64(file);
		const range = quill.getSelection();
		quill.insertEmbed(range.index, 'image', imageUrl);
	}

	// ---------------------- POPUP HANDLER ----------------------
</script>

{#if browser}
	<div class="rich-text-editor" style="height: {height}">
		<input
			type="text"
			bind:value={title}
			placeholder="Enter note title"
			oninput={() => onChange({ title, html: quill.root.innerHTML, text: quill.getText() })}
		/>
		<div bind:this={editorElement}></div>
		<!-- showPopup -->
		{#if isDialogOpen}
			<div class="popup fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
				<div class="popup-content rounded-lg bg-white p-6 text-center shadow-lg">
					<p class="mb-4">{popupMessage}</p>
					<button
						class=" rounded bg-blue-500 px-4 py-2 text-white"
						onclick={() => (isDialogOpen = false)}>Close</button
					>
				</div>
			</div>
		{/if}
	</div>
{/if}

{#if isSettingsModalOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="settings-modal"
		role="dialog"
		onkeydown={(e) => e.key === 'Escape' && toggleSettings()}
	>
		<button
			class="settings-content"
			onclick={(e) => e.stopPropagation()}
			aria-label="Settings content"
		>
			<div class="settings-header">
				<h3>Toolbar Settings</h3>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div class="close-button" onclick={toggleSettings} role="button" tabindex="0">×</div>
			</div>
			<div class="settings-body">
				{#each Object.entries(toolState) as [key, value]}
					<label class="setting-item">
						<input
							type="checkbox"
							checked={value.visible}
							onchange={() => toggleToolVisibility(key as ToolKey)}
						/>
						<span>{value.label}</span>
					</label>
				{/each}
			</div>
		</button>
	</div>
	<button class="settings-modal-close" onclick={toggleSettings} aria-label="Close settings modal"
	></button>
	<button
		class="settings-modal-close"
		onclick={() => {
			toggleSettings();
			reinitializeQuill();
		}}
		aria-label="Close settings modal"
		onkeydown={(e) => e.key === 'Enter' && toggleSettings()}
	></button>
{/if}

<style>
	.rich-text-editor {
		border-radius: 0.25rem;
		overflow: hidden;
		min-height: 80svh;
	}

	.rich-text-editor :global(.ql-container) {
		height: calc(100% - 70px);
		border: none;
	}

	.rich-text-editor :global(.ql-toolbar) {
		border-bottom: 1px solid #ccc;
		background-color: #f8f8f8;
		z-index: 1;
	}

	.rich-text-editor :global([type='button']) {
		width: 24px;
		height: 24px;
	}
	.rich-text-editor :global([type='button']:hover) {
		background-color: #f0f0f0;
		color: red !important;
	}

	.rich-text-editor :global(.ql-editor) {
		min-height: 100%;
		font-size: 16px;
		line-height: 1.5;
	}

	.rich-text-editor input[type='text'] {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		margin-bottom: 0.5rem;
		box-sizing: border-box;
	}

	.settings-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.settings-content {
		background: white;
		border-radius: 8px;
		min-width: 300px;
		max-width: 90%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.settings-header {
		padding: 1rem;
		border-bottom: 1px solid #eee;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.settings-body {
		padding: 1rem;
	}

	.setting-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
	}

	/* Add Quill custom button style */
	.rich-text-editor :global(.ql-settings) {
		width: 24px;
		height: 24px;
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>');
		background-size: 16px;
		background-position: center;
		background-repeat: no-repeat;
	}
	.rich-text-editor :global(.ql-toolbar) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 5px;
	}

	.rich-text-editor :global(.ql-toolbar .ql-formats) {
		display: flex;
		align-items: center;
	}
	.rich-text-editor :global(.ql-toolbar .ql-formats:nth-last-child(2)) {
		flex: 1;
	}
	.rich-text-editor :global(.ql-toolbar .ql-formats:nth-last-child(1)) {
		margin: 0;
	}

	/*settings button */
	.rich-text-editor :global(.ql-toolbar .ql-settings) {
		border-left: 1px solid #ccc;
		padding-left: 20px;
	}
</style>
