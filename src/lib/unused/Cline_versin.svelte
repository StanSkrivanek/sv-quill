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

	let editorElement = $state();
	let isEditorReady = false;
	let isSettingsOpen = $state(false);

	// ----------------- toolbar tools -----------------

	// toolbar tools types
	interface ToolConfigType {
		enabled: boolean;
		visible: boolean;
		label: string;
	}

	type ToolKey = 'font' | 'header' | 'bold' | 'italic' | 'underline' | 'strike' | 'list' | 'blockquote' | 
		'codeBlock' | 'color' | 'background' | 'script' | 'indent' | 'direction' | 'align' | 'link' | 
		'image' | 'video' | 'clean';

	type ToolsState = {
		[K in ToolKey]: ToolConfigType;
	};

	// toolbar tools state
	const tools = $state<ToolsState>({
		font: { enabled: false, visible: false, label: 'Font' },
		header: { enabled: true, visible: true, label: 'Headers' },
		bold: { enabled: true, visible: true, label: 'Bold' },
		italic: { enabled: true, visible: true, label: 'Italic' },
		underline: { enabled: true, visible: true, label: 'Underline' },
		strike: { enabled: true, visible: true, label: 'Strike' },
		list: { enabled: true, visible: true, label: 'Lists' },
		blockquote: { enabled: true, visible: true, label: 'Blockquote' },
		codeBlock: { enabled: false, visible: false, label: 'Code Block' },
		color: { enabled: true, visible: true, label: 'Text Color' },
		background: { enabled: true, visible: true, label: 'Background Color' },
		script: { enabled: false, visible: false, label: 'Subscript/Superscript' },
		indent: { enabled: true, visible: true, label: 'Indentation' },
		direction: { enabled: true, visible: true, label: 'Text Direction' },
		align: { enabled: true, visible: true, label: 'Alignment' },
		link: { enabled: true, visible: true, label: 'Link' },
		image: { enabled: true, visible: true, label: 'Image' },
		video: { enabled: true, visible: true, label: 'Video' },
		clean: { enabled: true, visible: true, label: 'Clear Formatting' }
	});

	type ToolbarOptionValue = string | number | boolean | any[];
	type ToolbarOptionObject = { [key: string]: ToolbarOptionValue };
	type ToolbarOption = string | ToolbarOptionObject;
	type ToolbarGroup = ToolbarOption[];
	type ToolbarOptions = ToolbarGroup[];

	function generateToolbarOptions(settings: ToolsState): ToolbarOptions {
		const options: ToolbarOptions = [['settings']];
		const inlineOptions: string[] = [];
		const colorOptions: ToolbarOptionObject[] = [];
		const mediaOptions: string[] = [];

		for (const [key, value] of Object.entries(settings)) {
			if (value.enabled) {
				switch (key) {
					case 'font':
						options.push([{ font: [] }]);
						break;
					case 'header':
						options.push([{ header: [1, 2, 3, 4, 5, 6, false] }]);
						break;
					case 'bold':
					case 'italic':
					case 'underline':
					case 'strike':
						inlineOptions.push(key);
						break;
					case 'list':
						options.push([{ list: 'ordered' }, { list: 'bullet' }]);
						break;
					case 'blockquote':
						options.push(['blockquote']);
						break;
					case 'codeBlock':
						options.push(['code-block']);
						break;
					case 'color':
						colorOptions.push({ color: [] });
						break;
					case 'background':
						colorOptions.push({ background: [] });
						break;
					case 'script':
						options.push([{ script: 'sub' }, { script: 'super' }]);
						break;
					case 'indent':
						options.push([{ indent: '-1' }, { indent: '+1' }]);
						break;
					case 'direction':
						options.push([{ direction: 'rtl' }]);
						break;
					case 'align':
						options.push([{ align: [] }]);
						break;
					case 'link':
					case 'image':
					case 'video':
						mediaOptions.push(key);
						break;
					case 'clean':
						options.push(['clean']);
						break;
				}
			}
		}

		if (inlineOptions.length) options.push(inlineOptions);
		if (colorOptions.length) options.push(colorOptions);
		if (mediaOptions.length) options.push(mediaOptions);

		return options;
	}

	let toolbarOptions = generateToolbarOptions(tools);

	function updateToolbarOption(option: ToolKey, type: 'enabled' | 'visible') {
		tools[option][type] = !tools[option][type];
		toolbarOptions = generateToolbarOptions(tools);
		if (quill) {
			quill.getModule('toolbar').container.innerHTML = '';
			quill.getModule('toolbar').container.appendChild(createToolbar());
		}
	}

	function createToolbar() {
		const container = document.createElement('div');
		container.className = 'ql-toolbar ql-snow';
		
		// Add settings button
		const settingsGroup = document.createElement('span');
		settingsGroup.className = 'ql-formats';
		const settingsButton = document.createElement('button');
		settingsButton.className = 'ql-settings';
		settingsButton.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24">
			<path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.65.07-.97 0-.32-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65c-.04-.24-.25-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.32-.07.65-.07.97 0 .32.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63z"/>
		</svg>`;
		settingsButton.onclick = () => {
			isSettingsOpen = !isSettingsOpen;
		};
		settingsGroup.appendChild(settingsButton);
		container.appendChild(settingsGroup);

		// Add other toolbar items
		toolbarOptions.slice(1).forEach(group => {
			const span = document.createElement('span');
			span.className = 'ql-formats';
			group.forEach(format => {
				if (typeof format === 'string') {
					const button = document.createElement('button');
					button.className = `ql-${format}`;
					span.appendChild(button);
				} else {
					const key = Object.keys(format)[0];
					const select = document.createElement('select');
					select.className = `ql-${key}`;
					if (Array.isArray(format[key])) {
						format[key].forEach(value => {
							const option = document.createElement('option');
							if (value !== false) option.setAttribute('value', String(value));
							select.appendChild(option);
						});
					}
					span.appendChild(select);
				}
			});
			container.appendChild(span);
		});

		return container;
	}

	// Ensure quill is initialized before accessing its properties
	if (quill) {
		// Force update of toolbar buttons
		setTimeout(() => {
			const option: keyof typeof tools = 'bold';
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

				quill = new Quill(editorElement, {
					modules: {
						toolbar: {
							container: toolbarOptions,
							handlers: {
								image: imageHandler,
								settings: function() {
									isSettingsOpen = !isSettingsOpen;
								}
							}
						}
					},
					placeholder,
					readOnly: readonly,
					theme: 'snow'
				});

				// Safely set initial content
				if (noteContent) {
					quill.root.innerHTML = DOMPurify.sanitize(noteContent, allowedOptions);
				}

				isEditorReady = true;

				quill.on('text-change', () => {
					const html = quill.root.innerHTML;
					const cleanHtml = DOMPurify.sanitize(html, allowedOptions);
					const text = quill.getText();
					onChange({ title, html: cleanHtml, text });
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

		{#if isSettingsOpen}
			<div class="settings-panel">
				<div class="settings-header">
					<h3>Editor Tools Settings</h3>
					<button class="close-button" onclick={() => (isSettingsOpen = false)}>×</button>
				</div>
				<div class="settings-content">
					{#each Object.entries(tools) as [key, tool]}
						<div class="tool-setting">
							<label>
								<input
									type="checkbox"
									checked={tool.visible}
									onchange={() => updateToolbarOption(key as ToolKey, 'visible')}
								/>
								<span>{tool.label}</span>
							</label>
							{#if tool.visible}
								<label class="enable-checkbox">
									<input
										type="checkbox"
										checked={tool.enabled}
										onchange={() => updateToolbarOption(key as ToolKey, 'enabled')}
									/>
									<span>Enable</span>
								</label>
							{/if}
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
	}

	.enable-checkbox {
		color: #666;
		font-size: 0.9em;
	}
</style>
