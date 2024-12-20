import { NotesHandler } from '$lib/server/notes';
import type { Actions } from './$types';

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString() || '';
		const html = formData.get('html')?.toString() || '';
		const text = formData.get('text')?.toString() || '';

		const notesHandler = new NotesHandler();
		notesHandler.saveNote({ title, html, text });

		return;
	}
};
