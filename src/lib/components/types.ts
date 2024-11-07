// types.ts
export interface Props {
	noteContent?: string;
	title?: string;
	placeholder?: string;
	readonly?: boolean;
	height?: string;
	onChange?: (details: { title: string; html: string; text: string }) => void;
}

export interface ToolConfigType {
	visible: boolean;
	label: string;
}

export type ToolKey =
	| 'font'
	| 'header'
	| 'bold'
	| 'italic'
	| 'underline'
	| 'strike'
	| 'list'
	| 'blockquote'
	| 'codeBlock'
	| 'color'
	| 'background'
	| 'script'
	| 'indent'
	| 'direction'
	| 'align'
	| 'link'
	| 'image'
	| 'video'
	| 'clean';

export type ToolsState = {
	[K in ToolKey]: ToolConfigType;
};
