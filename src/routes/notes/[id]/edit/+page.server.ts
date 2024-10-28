import { error } from '@sveltejs/kit';
import { NotesHandler } from '$lib/server/notes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const noteId = parseInt(params.id);
	console.log("🚀 ~ NOTE EDIT :PageServerLoad= ~ noteId:", noteId)

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

export const actions = {
	update: async ({ request }) => {
		try {
			const formData = await request.formData();
			const id = formData.get('id')?.toString() || '';
			const html = formData.get('html')?.toString() || '';
			const text = formData.get('text')?.toString() || '';

			const notesHandler = new NotesHandler();
			const success = notesHandler.updateNote(parseInt(id), { html, text });

			return {
				success
			};
		} catch (error) {
			console.error('Error updating content:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update content'
			};
		}
	}
};
