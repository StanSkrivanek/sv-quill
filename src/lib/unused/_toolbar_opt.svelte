<!-- <script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';

	interface ToolbarConfig {
		enabled: boolean;
		visible: boolean;
	}

	// toolbar tools types
	interface ToolbarSettings {
		font: ToolbarConfig;
		header: ToolbarConfig;
		bold: ToolbarConfig;
		italic: ToolbarConfig;
		underline: ToolbarConfig;
		strike: ToolbarConfig;
		list: ToolbarConfig;
		blockquote: ToolbarConfig;
		codeBlock: ToolbarConfig;
		color: ToolbarConfig;
		background: ToolbarConfig;
		script: ToolbarConfig;
		indent: ToolbarConfig;
		direction: ToolbarConfig;
		align: ToolbarConfig;
		link: ToolbarConfig;
		image: ToolbarConfig;
		video: ToolbarConfig;
		clean: ToolbarConfig;
	}

	interface Props {
		noteContent?: string;
		title?: string;
		placeholder?: string;
		readonly?: boolean;
		height?: string;
		onChange?: (details: { title: string; html: string; text: string }) => void;
	}

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
	let editorElement = $state();
	let isEditorReady = false;
	let isSettingsOpen = $state(false);

	// Toolbar settings
	let tools: ToolbarSettings = $state({
		font: { enabled: false, visible: false },
		header: { enabled: true, visible: true },
		bold: { enabled: true, visible: true },
		italic: { enabled: true, visible: true },
		underline: { enabled: true, visible: true },
		strike: { enabled: true, visible: true },
		list: { enabled: true, visible: true },
		blockquote: { enabled: true, visible: true },
		codeBlock: { enabled: false, visible: false },
		color: { enabled: true, visible: true },
		background: { enabled: true, visible: true },
		script: { enabled: false, visible: false },
		indent: { enabled: true, visible: true },
		direction: { enabled: true, visible: true },
		align: { enabled: true, visible: true },
		link: { enabled: true, visible: true },
		image: { enabled: true, visible: true },
		video: { enabled: true, visible: true },
		clean: { enabled: true, visible: true }
	});

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
		[{ align: [] }],
		['link', 'image', 'video'],
		['clean']
	];

	function toggleSettings() {
		isSettingsOpen = !isSettingsOpen;
	}

	function updateToolbarOption(option: keyof ToolbarSettings, type: 'enabled' | 'visible') {
		tools[option][type] = !tools[option][type];
		tools = { ...tools };

		// Force update of toolbar buttons
		setTimeout(() => {
			const buttons = quill.container.querySelectorAll(`.ql-${option}`);
			const formats = quill.container.querySelectorAll(`.ql-formats`);

			buttons.forEach((button: HTMLElement) => {
				if (!tools[option].visible) {
					button.closest('.ql-formats')?.classList.add('hidden');
					button.style.display = 'none';
				} else {
					button.closest('.ql-formats')?.classList.remove('hidden');
					button.style.display = '';
					if (!tools[option].enabled) {
						button.setAttribute('disabled', 'true');
						button.style.opacity = '0.5';
						button.style.cursor = 'not-allowed';
					} else {
						button.removeAttribute('disabled');
						button.style.opacity = '';
						button.style.cursor = '';
					}
				}
			});

			// Clean up empty format groups
			formats.forEach((format: HTMLElement) => {
				const visibleButtons = format.querySelectorAll('button:not([style*="display: none"])');
				if (visibleButtons.length === 0) {
					format.classList.add('hidden');
				} else {
					format.classList.remove('hidden');
				}
			});
		}, 0);
	}

	// IMAGE UPLOAD HANDLER
	async function convertToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	}

	const imageHandler = () => {
		if (!toolbarSettings.image.enabled) return;

		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = async () => {
			const file = input.files?.[0];
			if (file) {
				try {
					const maxSizeKB = 200;
					if (file.size > maxSizeKB * 1024) {
						showPopup(`Image size should not exceed ${maxSizeKB}KB`);
						return;
					}

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

	async function convertAndInsertImage(file: File) {
		const imageUrl = await convertToBase64(file);
		const range = quill.getSelection();
		quill.insertEmbed(range.index, 'image', imageUrl);
	}

	// POPUP
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
		}, 6000);
	}

	onMount(async () => {
		if (browser) {
			const [quillModule, domPurifyModule] = await Promise.all([
				import('quill'),
				import('dompurify')
			]);
			Quill = quillModule.default;
			DOMPurify = domPurifyModule.default;

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

			// Initial toolbar setup
			Object.keys(tools).forEach((option) => {
				const key = option as keyof ToolbarSettings;
				const buttons = quill.container.querySelectorAll(`.ql-${key}`);
				buttons.forEach((button: HTMLElement) => {
					if (!tools[key].visible) {
						button.closest('.ql-formats')?.classList.add('hidden');
						button.style.display = 'none';
					} else if (!tools[key].enabled) {
						button.setAttribute('disabled', 'true');
						button.style.opacity = '0.5';
						button.style.cursor = 'not-allowed';
					}
				});
			});

			if (noteContent) {
				quill.root.innerHTML = DOMPurify.sanitize(noteContent);
			}

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

				onChange({
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
			oninput={() => onChange({ title, html: quill.root.innerHTML, text: quill.getText() })}
		/>
		<div class="toolbar-wrapper">
			<div bind:this={editorElement}></div>
			<button class="settings-button" onclick={toggleSettings} aria-label="Toggle settings">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-5 w-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			</button>
			{#if isSettingsOpen}
				<div class="settings-dropdown">
					<div class="settings-header">
						<h3>Toolbar Settings</h3>
						<button class="close-button" onclick={toggleSettings}>×</button>
					</div>
					<div class="settings-content">
						{#each Object.entries(tools) as [option, config]}
							<div class="setting-item">
								<span class="setting-label">{option}</span>
								<div class="setting-controls">
								 <label class="toggle-label">
										<input
											type="checkbox"
											checked={config.visible}
											onchange={() =>
												updateToolbarOption(option as keyof ToolbarSettings, 'visible')}
										/>
										<span class="toggle-text">Visible</span>
									</label> --
									<label class="toggle-label">
										<input
											type="checkbox"
											checked={config.enabled}
											onchange={() =>
												updateToolbarOption(option as keyof ToolbarSettings, 'enabled')}
										/>
										<span class="toggle-text">Enabled</span>
									</label>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.rich-text-editor {
		border-radius: 0.5rem;
		overflow: hidden;
		min-height: 80svh;
		background-color: white;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.toolbar-wrapper {
		position: relative;
	}

	.settings-button {
		position: absolute;
		top: 8px;
		right: 8px;
		padding: 6px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		color: #4b5563;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		z-index: 20;
	}

	.settings-button:hover {
		border-color: #f97316;
		color: #f97316;
	}

	.settings-dropdown {
		position: absolute;
		top: 48px;
		right: 8px;
		width: 300px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		z-index: 30;
	}

	.settings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		border-bottom: 1px solid #e5e7eb;
	}

	.settings-header h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
	}

	.close-button {
		font-size: 1.5rem;
		color: #6b7280;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0 4px;
	}

	.close-button:hover {
		color: #f97316;
	}

	.settings-content {
		max-height: 400px;
		overflow-y: auto;
		padding: 12px;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.setting-label {
		font-size: 0.875rem;
		color: #4b5563;
		text-transform: capitalize;
	}

	.setting-controls {
		display: flex;
		gap: 12px;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.75rem;
		color: #6b7280;
		cursor: pointer;
	}

	.toggle-text {
		user-select: none;
	}

	:global(.hidden) {
		display: none !important;
	}

	.rich-text-editor :global(.ql-container) {
		height: calc(100% - 70px);
		border: none;
		background-color: #ffffff;
	}

	.rich-text-editor :global(.ql-toolbar) {
		border: none;
		border-bottom: 1px solid #e5e7eb;
		background-color: #f9fafb;
		padding: 0.75rem;
		position: sticky;
		top: 0;
		z-index: 10;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	.rich-text-editor :global(.ql-formats) {
		margin-right: 18px !important;
	}

	.rich-text-editor :global(.ql-formats:last-child) {
		margin-right: 0 !important;
	}

	.rich-text-editor :global(.ql-picker) {
		height: 24px;
	}

	/* Default icon colors */
	.rich-text-editor :global(.ql-stroke:not(.ql-color-label):not(.ql-bg-label)) {
		stroke: #4b5563 !important;
		transition: all 0.2s ease-in-out;
	}

	.rich-text-editor :global(.ql-fill:not(.ql-color-label):not(.ql-bg-label)) {
		fill: #4b5563 !important;
		transition: all 0.2s ease-in-out;
	}

	/* Preserve color picker colors */
	.rich-text-editor :global(.ql-color .ql-stroke.ql-color-label),
	.rich-text-editor :global(.ql-background .ql-stroke.ql-color-label) {
		stroke: #444 !important;
	}

	.rich-text-editor :global(.ql-color .ql-fill.ql-color-label),
	.rich-text-editor :global(.ql-background .ql-fill.ql-color-label) {
		fill: #444 !important;
	}

	/* Color picker specific styles */
	.rich-text-editor :global(.ql-color-picker),
	.rich-text-editor :global(.ql-background) {
		width: 32px !important;
	}

	.rich-text-editor :global(.ql-color-picker .ql-picker-label),
	.rich-text-editor :global(.ql-background .ql-picker-label) {
		padding: 0 4px !important;
	}

	.rich-text-editor :global(.ql-color-picker .ql-picker-options),
	.rich-text-editor :global(.ql-background .ql-picker-options) {
		padding: 8px !important;
		width: 152px !important;
	}

	.rich-text-editor :global(.ql-picker-item) {
		margin: 2px !important;
		border-radius: 2px !important;
		transition: all 0.2s ease-in-out;
	}

	.rich-text-editor :global(.ql-icon-picker) {
		width: 32px !important;
		height: 32px !important;
		margin: 2px !important;
		border-radius: 2px !important;
		transition: all 0.2s ease-in-out;
	}

	.rich-text-editor :global(.ql-icon-picker:hover) {
		transform: scale(1.1);
		box-shadow: 0 0 0 2px #f97316;
	}

	.rich-text-editor :global(.ql-picker-label) {
		border: 1px solid #e5e7eb !important;
		border-radius: 0.375rem;
		align-items: center;
		transition: all 0.2s ease-in-out;
	}

	.rich-text-editor :global(.ql-picker-options) {
		border: 1px solid #e5e7eb !important;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		padding: 5px 0;
	}

	.rich-text-editor :global([type='button']) {
		width: 28px;
		height: 28px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		border: 1px solid #e5e7eb;
		transition: all 0.2s ease-in-out;
		margin: 0 1px;
	}

	.rich-text-editor :global([type='button']:not([disabled]):hover) {
		background-color: #fff;
		border-color: #f97316;
	}

	/* Hover effects for non-color picker icons */
	.rich-text-editor
		:global(
			[type='button']:not([disabled]):hover .ql-stroke:not(.ql-color-label):not(.ql-bg-label)
		) {
		stroke: #f97316 !important;
	}

	.rich-text-editor
		:global([type='button']:not([disabled]):hover .ql-fill:not(.ql-color-label):not(.ql-bg-label)) {
		fill: #f97316 !important;
	}

	.rich-text-editor :global(.ql-active) {
		background-color: #fff !important;
		border-color: #f97316 !important;
	}

	.rich-text-editor :global(.ql-active .ql-stroke:not(.ql-color-label):not(.ql-bg-label)) {
		stroke: #f97316 !important;
	}

	.rich-text-editor :global(.ql-active .ql-fill:not(.ql-color-label):not(.ql-bg-label)) {
		fill: #f97316 !important;
	}

	.rich-text-editor :global(.ql-editor) {
		min-height: 100%;
		font-size: 16px;
		line-height: 1.6;
		color: #1f2937;
		padding: 1.5rem;
	}

	.rich-text-editor :global(.ql-editor p) {
		margin-bottom: 1rem;
	}

	.rich-text-editor input[type='text'] {
		width: 100%;
		padding: 1rem 1.5rem;
		border: none;
		border-bottom: 1px solid #e5e7eb;
		margin: 0;
		font-size: 1.25rem;
		font-weight: 500;
		color: #1f2937;
		background-color: #ffffff;
		transition: all 0.2s ease-in-out;
	}

	.rich-text-editor input[type='text']:focus {
		outline: none;
		border-color: #f97316;
		background-color: #fff;
	}

	.rich-text-editor input[type='text']::placeholder {
		color: #9ca3af;
	}
</style> -->
