// hooks.server.ts
import { initializeDatabase, closeDatabase } from './src/lib/server/db';
import type { Handle } from '@sveltejs/kit';

let isInitialized = false;

export const handle: Handle = async ({ event, resolve }) => {
	if (!isInitialized) {
		try {
			console.log('Initializing database...');
			await initializeDatabase();
			isInitialized = true;
			console.log('Database initialized successfully');
			console.log('Database path:', process.env.DB_PATH);
		} catch (error) {
			console.error('Failed to initialize database:', error);
			throw error;
		}
	}

	// Process the request
	const response = await resolve(event);
	return response;
};

// Clean up database connection when server shuts down
if (typeof process !== 'undefined') {
	process.on('SIGTERM', () => {
		console.log('Closing database connection...');
		closeDatabase();
		process.exit(0);
	});

	process.on('SIGINT', () => {
		console.log('Closing database connection...');
		closeDatabase();
		process.exit(0);
	});
}
