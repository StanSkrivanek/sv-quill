// config.ts
export const ALLOWED_OPTIONS = {
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

export const IMAGE_CONFIG = {
	maxSizeKB: 200,
	maxWidth: 1280,
	maxHeight: 960
};

interface ToolsState {
	font: { visible: boolean; label: string };
	header: { visible: boolean; label: string };
	bold: { visible: boolean; label: string };
	italic: { visible: boolean; label: string };
	underline: { visible: boolean; label: string };
	strike: { visible: boolean; label: string };
	list: { visible: boolean; label: string };
	blockquote: { visible: boolean; label: string };
	codeBlock: { visible: boolean; label: string };
	color: { visible: boolean; label: string };
	background: { visible: boolean; label: string };
	script: { visible: boolean; label: string };
	indent: { visible: boolean; label: string };
	direction: { visible: boolean; label: string };
	align: { visible: boolean; label: string };
	link: { visible: boolean; label: string };
	image: { visible: boolean; label: string };
	video: { visible: boolean; label: string };
	clean: { visible: boolean; label: string };
}

export const INITIAL_TOOL_STATE: ToolsState = {
	font: { visible: true, label: 'Font' },
	header: { visible: true, label: 'Headers' },
	bold: { visible: true, label: 'Bold' },
	italic: { visible: true, label: 'Italic' },
	underline: { visible: true, label: 'Underline' },
	strike: { visible: true, label: 'Strike' },
	list: { visible: true, label: 'Lists' },
	blockquote: { visible: true, label: 'Blockquote' },
	codeBlock: { visible: true, label: 'Code Block' },
	color: { visible: true, label: 'Text Color' },
	background: { visible: true, label: 'Background Color' },
	script: { visible: true, label: 'Subscript/Superscript' },
	indent: { visible: true, label: 'Indentation' },
	direction: { visible: true, label: 'Text Direction' },
	align: { visible: true, label: 'Alignment' },
	link: { visible: true, label: 'Link' },
	image: { visible: true, label: 'Image' },
	video: { visible: true, label: 'Video' },
	clean: { visible: true, label: 'Clear Formatting' }
};
