// config.ts
import type { ToolConfigType } from './types';

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
	font: ToolConfigType;
	header: ToolConfigType;
	bold: ToolConfigType;
	italic: ToolConfigType;
	underline: ToolConfigType;
	strike: ToolConfigType;
	list: ToolConfigType;
	blockquote: ToolConfigType;
	codeBlock: ToolConfigType;
	color: ToolConfigType;
	background: ToolConfigType;
	script: ToolConfigType;
	indent: ToolConfigType;
	direction: ToolConfigType;
	align: ToolConfigType;
	link: ToolConfigType;
	image: ToolConfigType;
	video: ToolConfigType;
	clean: ToolConfigType;
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
