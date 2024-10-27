import { NotesHandler } from '$lib/server/notes';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const html = formData.get('html')?.toString() || '';
		const text = formData.get('text')?.toString() || '';

		const notesHandler = new NotesHandler();
		const noteId = notesHandler.saveNote({ html, text });

		throw redirect(303, `/notes/${noteId}`);
	}
};
