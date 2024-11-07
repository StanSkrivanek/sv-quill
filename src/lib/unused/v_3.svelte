<script lang="ts">
	import { browser } from '$app/environment';

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
	let currentTitle = $state(title);

	let editorElement = $state<HTMLDivElement>();
	let isEditorReady = $state(false);
	let isSettingsOpen = $state(false);

	// ----------------- toolbar tools -----------------

	// toolbar tools types
	interface ToolConfigType {
		visible: boolean;
		label: string;
	}

	type ToolKey = 'font' | 'header' | 'bold' | 'italic' | 'underline' | 'strike' | 'list' | 'blockquote' | 
		'codeBlock' | 'color' | 'background' | 'script' | 'indent' | 'direction' | 'align' | 'link' | 
		'image' | 'video' | 'clean';

	type ToolsState = {
		[K in ToolKey]: ToolConfigType;
	};

	function isToolKey(key: string): key is ToolKey {
		return key in toolState;
	}

	// Create state for tools
	const toolState = $state<ToolsState>({
		font: { visible: false, label: 'Font' },
		header: { visible: true, label: 'Headers' },
		bold: { visible: true, label: 'Bold' },
		italic: { visible: true, label: 'Italic' },
		underline: { visible: true, label: 'Underline' },
		strike: { visible: true, label: 'Strike' },
		list: { visible: true, label: 'Lists' },
		blockquote: { visible: true, label: 'Blockquote' },
		codeBlock: { visible: false, label: 'Code Block' },
		color: { visible: true, label: 'Text Color' },
		background: { visible: true, label: 'Background Color' },
		script: { visible: false, label: 'Subscript/Superscript' },
		indent: { visible: true, label: 'Indentation' },
		direction: { visible: false, label: 'Text Direction' },
		align: { visible: true, label: 'Alignment' },
		link: { visible: true, label: 'Link' },
		image: { visible: true, label: 'Image' },
		video: { visible: true, label: 'Video' },
		clean: { visible: true, label: 'Clear Formatting' }
	});

	// Create derived state for toolbar options
	const toolbarOptions = $derived(() => {
		return [
			['settings'], // Add settings button first
			[{ header: toolState.header.visible ? [1, 2, 3, 4, 5, 6, false] : [] }],
			[
				...(toolState.bold.visible ? ['bold'] : []),
				...(toolState.italic.visible ? ['italic'] : []),
				...(toolState.underline.visible ? ['underline'] : []),
				...(toolState.strike.visible ? ['strike'] : [])
			],
			[
				...(toolState.list.visible ? [{ list: 'ordered' }, { list: 'bullet' }] : [])
			],
			[
				...(toolState.blockquote.visible ? ['blockquote'] : []),
				...(toolState.codeBlock.visible ? ['code-block'] : [])
			],
			[
				...(toolState.color.visible ? [{ color: [] }] : []),
				...(toolState.background.visible ? [{ background: [] }] : [])
			],
			...(toolState.script.visible ? [[{ script: 'sub' }, { script: 'super' }]] : []),
			...(toolState.indent.visible ? [[{ indent: '-1' }, { indent: '+1' }]] : []),
			...(toolState.direction.visible ? [[{ direction: 'rtl' }]] : []),
			...(toolState.align.visible ? [[{ align: [] }]] : []),
			[
				...(toolState.link.visible ? ['link'] : []),
				...(toolState.image.visible ? ['image'] : []),
				...(toolState.video.visible ? ['video'] : [])
			],
			...(toolState.clean.visible ? [['clean']] : [])
		].filter(group => group.length > 0);
	});

	
	// ----------------- Image handler -----------------
	async function convertToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	}

	const imageHandler = () => {
		if (!toolState.image.visible) return;

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

	// ----------------- Toggle tool visibility -----------------
	function toggleToolVisibility(key: ToolKey) {
		toolState[key].visible = !toolState[key].visible;
	}

	// ----------------- Show popup -----------------
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

	function handleTitleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		currentTitle = target.value;
		onChange({ title: currentTitle, html: quill?.root?.innerHTML || '', text: quill?.getText() || '' });
	}

	$effect(() => {
		if (!browser || isEditorReady) return;

		let mounted = true;

		async function initializeQuill() {
			try {
				const [quillModule, domPurifyModule] = await Promise.all([
					import('quill'),
					import('dompurify')
				]);

				if (!mounted) return;

				Quill = quillModule.default;
				DOMPurify = domPurifyModule.default;

				// Initialize Quill with toolbar options
				quill = new Quill(editorElement, {
					modules: {
						toolbar: {
							container: toolbarOptions(),
							handlers: {
								image: imageHandler,
								settings: () => {
									isSettingsOpen = !isSettingsOpen;
								}
							}
						},
						history: {
							delay: 2000,
							maxStack: 500,
							userOnly: true
						}
					},
					placeholder,
					readOnly: readonly,
					theme: 'snow'
				});

				// Add settings button icon
				const settingsButton = quill.container.querySelector('.ql-settings');
				if (settingsButton) {
					settingsButton.innerHTML = `
						<svg viewBox="0 0 24 24" width="24" height="24">
							<path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.65.07-.97 0-.32-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65c-.04-.24-.25-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.32-.07.65-.07.97 0 .32.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63z"/>
						</svg>
					`;
				}

				// Set initial content
				if (noteContent) {
					quill.root.innerHTML = DOMPurify.sanitize(noteContent, allowedOptions);
				}

				isEditorReady = true;

				quill.on('text-change', () => {
					const html = quill.root.innerHTML;
					const cleanHtml = DOMPurify.sanitize(html, allowedOptions);
					const text = quill.getText();
					onChange({ title: currentTitle, html: cleanHtml, text });
				});

			} catch (error) {
				console.error('Failed to initialize Quill:', error);
			}
		}

		initializeQuill();

		// Cleanup function
		return () => {
			mounted = false;
			if (quill) {
				quill.off('text-change');
				quill = null;
			}
		};
	});

	const allowedOptions = {
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
		ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'controls', 'width', 'height'],
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
	};
</script>

{#if browser}
	<div class="rich-text-editor" style="height: {height}">
		<input
			type="text"
			bind:value={currentTitle}
			placeholder="Enter note title"
		/>
		<div bind:this={editorElement}></div>

		{#if isSettingsOpen}
			<div class="settings-panel">
				<div class="settings-header">
					<h3>Editor Tools Settings</h3>
					<button 
						class="close-button" 
						onclick={() => (isSettingsOpen = false)}
					>×</button>
				</div>
				<div class="settings-content">
					{#each Object.entries(toolState) as [key, tool]}
						<div class="tool-setting">
							<label>
								<input
									type="checkbox"
									checked={tool.visible}
									onchange={() => toggleToolVisibility(key as ToolKey)}
								/>
								<span>{tool.label}</span>
							</label>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.rich-text-editor {
		border-radius: 0.25rem;
		overflow: hidden;
		min-height: 80svh;
		position: relative;
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

	.rich-text-editor :global(.ql-settings) {
		width: 24px;
		height: 24px;
		padding: 3px;
		cursor: pointer;
		background: none;
		border: none;
		color: #444;
	}

	.rich-text-editor :global(.ql-settings:hover) {
		color: #06c;
	}

	.rich-text-editor :global(.ql-settings svg) {
		width: 18px;
		height: 18px;
		display: block;
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

	.settings-panel {
		position: absolute;
		top: 40px;
		right: 10px;
		background: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		width: 300px;
		z-index: 1000;
	}

	.settings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
		border-bottom: 1px solid #eee;
	}

	.settings-header h3 {
		margin: 0;
		font-size: 16px;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 20px;
		cursor: pointer;
		padding: 0 5px;
	}

	.settings-content {
		max-height: 400px;
		overflow-y: auto;
		padding: 10px;
	}

	.tool-setting {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 5px 0;
	}

	.tool-setting label {
		display: flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
	}

	.tool-setting input[type="checkbox"] {
		cursor: pointer;
	}
</style>
