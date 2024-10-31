import { error } from '@sveltejs/kit';
import { NotesHandler } from '$lib/server/notes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const noteId = parseInt(params.id);

	if (isNaN(noteId)) {
		throw error(400, 'Invalid note ID');
	}

	const notesHandler = new NotesHandler();
	const note = notesHandler.getNote(noteId);

	if (!note) {
		throw error(404, 'Note not found');
	}

	return {
		note
	};
};
//delete Note
export const actions = {
	delete: async ({ request }) => {
		try {
			const formData = await request.formData();
			const id = formData.get('id')?.toString() || '';

			const notesHandler = new NotesHandler();
			const success = notesHandler.deleteNote(parseInt(id));

			return {
				success
			};
		} catch (error) {
			console.error('Error deleting content:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete content'
			};
		}
	}
};
