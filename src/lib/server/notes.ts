// Notes API handler
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { getDatabase } from './db';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

interface Note {
	id: number;
	title: string;
	html: string;
	text: string;
	excerpt: string;
	created_at?: string;
	updated_at?: string;
}

export class NotesHandler {
	private db;
	constructor() {
		console.log('Initializing NotesHandler...');
		try {
			this.db = getDatabase();
			console.log('Database connection obtained successfully');
		} catch (error) {
			console.error('Error in NotesHandler constructor:', error);
			throw error;
		}
	}
	// Extract title (first H1) and excerpt from HTML content
	private processContent(html: string, text: string) {
		// Create a DOM parser to extract the first H1
		// const dom = new JSDOM(html);
		// console.log('🚀 ~ NotesHandler ~ processContent ~ dom:', dom);
		// Create excerpt from text (non-HTML) content
		const excerpt = text.length > 300 ? `${text.slice(0, 240)}...` : text;

		return { excerpt };
	}

	private sanitizeContent(html: string): string {
		return purify.sanitize(html, {
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
			]
			// ALLOWED_STYLES: [
			// 	'color',
			// 	'background-color',
			// 	'text-align',
			// 	'font-size',
			// 	'font-family',
			// 	'margin',
			// 	'margin-left',
			// 	'padding'
			// ]
		});
	}

	saveNote(note: { title: string; html: string; text: string }) {
		const sanitizedHtml = this.sanitizeContent(note.html);
		const title = note.title;
		const {  excerpt } = this.processContent(sanitizedHtml, note.text);

		const stmt = this.db.prepare(
			`
			INSERT INTO notes (title, html, text, excerpt)
			VALUES (?, ?, ?, ?)
    		`
		);

		const result = stmt.run(title, sanitizedHtml, note.text, excerpt);
		return result.lastInsertRowid as number;
	}

	getAllNotes(): Note[] {
		return this.db
			.prepare(
				`
      		SELECT id, title, excerpt, created_at, updated_at
      		FROM notes
      		ORDER BY created_at DESC
    			`
			)
			.all() as Note[];
	}

	getNote(id: number): Note | undefined {
		// console.log('---- GET NOTE ID', id);
		return this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note;
	}

	updateNote(id: number, note: { title: string; html: string; text: string }): boolean {
		// console.log('---- UPDATE NOTE ID', id);
		const sanitizedHtml = this.sanitizeContent(note.html);
		const title = note.title;
		const {excerpt } = this.processContent(sanitizedHtml, note.text);

		const stmt = this.db.prepare(
			`
      	UPDATE notes 
      	SET title = ?, html = ?, text = ?, excerpt = ?
      	WHERE id = ?
    		`
		);

		const result = stmt.run(title, sanitizedHtml, note.text, excerpt, id);
		return result.changes > 0;
	}

	// Method to delete a note by its ID
	deleteNote(id: number): boolean {
		// coerce the id to a number to ensure it is an integer value for the SQL query to execute properly eg.`3.0 -> 3`
		const noteId = parseInt(id.toString(), 10);
		// Prepare SQL statement to delete a note where the id matches the given id
		const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');

		// Execute the prepared statement with the provided id
		const result = stmt.run(noteId);

		// Return a boolean value indicating whether the note was deleted successfully
		return result.changes > 0;
	}
}
