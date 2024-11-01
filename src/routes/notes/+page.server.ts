// routes/+page.server.ts
import { NotesHandler } from '$lib/server/notes';
import type { Actions } from './$types';

// Optional: If you need to load any data for the page
export const load = async ({ url }) => {
	const notesHandler = new NotesHandler();
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const itemsPerPage = parseInt(url.searchParams.get('itemsPerPage') || '5', 10);
	const allNotes = notesHandler.getAllNotes();
	const totalNotes = allNotes.length;
	const totalPages = totalNotes > 0 ? Math.ceil(totalNotes / itemsPerPage) : 1; // Adjusted to handle zero notes

	// Ensure the current page is within valid range
	const currentPage = Math.min(Math.max(page, 1), totalPages);

	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedNotes = allNotes.slice(startIndex, endIndex);

	return {
		recentNotes: paginatedNotes,
		totalNotes,
		totalPages,
		currentPage,
		itemsPerPage
	};
};

export const actions: Actions = {
	saveNote: async ({ request }) => {
		try {
			const formData = await request.formData();

			const title = formData.get('title')?.toString() || '';
			const html = formData.get('html')?.toString() || '';
			const text = formData.get('text')?.toString() || '';

			const notesHandler = new NotesHandler();
			const noteId = notesHandler.saveNote({ title, html, text });

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
