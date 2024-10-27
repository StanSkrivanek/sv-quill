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
