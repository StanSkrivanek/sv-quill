// routes/+page.server.ts
import { NotesHandler } from '$lib/server/notes';
import type { Actions } from './$types';

export const actions: Actions = {
	saveContent: async ({ request }) => {
		try {
			const formData = await request.formData();
			const html = formData.get('html')?.toString() || '';
			const text = formData.get('text')?.toString() || '';

			const notesHandler = new NotesHandler();
			const noteId = notesHandler.saveNote({ html, text });

			return {
				success: true,
				id: noteId
			};
		} catch (error) {
			console.error('Error saving content:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to save content'
			};
		}
	}
};

// Optional: If you need to load any data for the page
export const load = async () => {
	const notesHandler = new NotesHandler();
	const recentNotes = notesHandler.getAllNotes().slice(0, 5); // Get 5 most recent notes

	return {
		recentNotes
	};
};
