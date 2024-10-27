import { initializeDatabase } from '$lib/server/db';

export const load = async () => {
	console.log('Page load: Initializing database...');
	await initializeDatabase();
	return { success: true };
};
