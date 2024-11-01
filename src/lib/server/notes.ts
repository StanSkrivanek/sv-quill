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
		try {
			this.db = getDatabase();
		} catch (error) {
			console.error('Error in NotesHandler constructor:', error);
			throw error;
		}
	}

	private processContent(html: string, text: string) {
		const excerpt = text.slice(0, 240) + (text.length > 300 ? '...' : '');
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
		});
	}

	saveNote(note: { title: string; html: string; text: string }) {
		const sanitizedHtml = this.sanitizeContent(note.html);
		const title = note.title;
		const { excerpt } = this.processContent(sanitizedHtml, note.text);

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
		return this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note;
	}

	updateNote(id: number, note: { title: string; html: string; text: string }): boolean {
		const sanitizedHtml = this.sanitizeContent(note.html);
		const title = note.title;
		const { excerpt } = this.processContent(sanitizedHtml, note.text);

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

	deleteNote(id: number): boolean {
		const noteId = parseInt(id.toString(), 10);
		const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
		const result = stmt.run(noteId);
		return result.changes > 0;
	}
}
