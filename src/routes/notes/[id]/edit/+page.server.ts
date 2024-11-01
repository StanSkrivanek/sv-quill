import { NotesHandler } from '$lib/server/notes';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const id = Number(params.id);
	const notesHandler = new NotesHandler();
	const note = notesHandler.getNote(id);

	if (!note) {
		throw error(404, 'Note not found');
	}

	return { note };
};

export const actions = {
	update: async ({ request }) => {
		try {
			const formData = await request.formData();
			const id = formData.get('id')?.toString() || '';
			const html = formData.get('html')?.toString() || '';
			const text = formData.get('text')?.toString() || '';
			const title = formData.get('title')?.toString() || '';

			const notesHandler = new NotesHandler();
			const success = notesHandler.updateNote(parseInt(id), { title, html, text });

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
	},
	delete: async ({ request }) => {
		try {
			const id = (await request.formData()).get('id')?.toString();
			// console.log('🚀 ~ DELETE: ~ id:', id);
			if (!id) throw new Error('Invalid ID');

			const success = new NotesHandler().deleteNote(parseInt(id));

			return { success };
		} catch (error) {
			console.error('Error deleting content:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete content'
			};
		}
	}
};
