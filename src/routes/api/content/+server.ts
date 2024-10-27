// api/content/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ContentHandler } from '$lib/server/_content';

const db = new ContentHandler();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const content = await request.json();
		const id = db.saveContent(content);
		return json({ id }, { status: 201 });
	} catch (error) {
		console.error('Error saving content:', error);
		return json({ error: 'Failed to save content' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');
		const query = url.searchParams.get('query');

		if (id) {
			const content = db.getContent(Number(id));
			if (!content) {
				return json({ error: 'Content not found' }, { status: 404 });
			}
			return json(content);
		}

		if (query) {
			const results = db.searchContent(query);
			return json(results);
		}

		const allContent = db.getAllContent();
		return json(allContent);
	} catch (error) {
		console.error('Error retrieving content:', error);
		return json({ error: 'Failed to retrieve content' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request, url }) => {
	try {
		const id = url.searchParams.get('id');
		if (!id) {
			return json({ error: 'ID is required' }, { status: 400 });
		}

		const content = await request.json();
		const success = db.updateContent(Number(id), content);

		if (!success) {
			return json({ error: 'Content not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error updating content:', error);
		return json({ error: 'Failed to update content' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');
		if (!id) {
			return json({ error: 'ID is required' }, { status: 400 });
		}

		const success = db.deleteContent(Number(id));
		if (!success) {
			return json({ error: 'Content not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting content:', error);
		return json({ error: 'Failed to delete content' }, { status: 500 });
	}
};
