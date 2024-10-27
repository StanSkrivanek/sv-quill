// lib/server/db/index.ts
import Database from 'better-sqlite3';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { env } from '$env/dynamic/private';

let db: Database.Database | null = null;
let isInitializing = false;
let initializationPromise: Promise<Database.Database> | null = null;

export async function initializeDatabase() {
	// If already initialized, return the existing database
	if (db) {
		return db;
	}

	// If initialization is in progress, wait for it
	if (isInitializing && initializationPromise) {
		return initializationPromise;
	}

	isInitializing = true;
	initializationPromise = (async () => {
		try {
			console.log('Starting database initialization...');

			// Get database path from environment
			const dbPath = env.DB_PATH || './data/content.db';
			console.log('Database path:', dbPath);

			// Ensure the directory exists
			const dirPath = dirname(dbPath);
			await mkdir(dirPath, { recursive: true });
			console.log('Database directory ensured:', dirPath);

			// Create database connection
			db = new Database(dbPath, {
				verbose: console.log,
				fileMustExist: false // Ensures the file is created if it doesn't exist
			});

			// Enable WAL mode and foreign keys
			db.pragma('journal_mode = WAL');
			db.pragma('foreign_keys = ON');

			// Create tables
			db.exec(`
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL DEFAULT '',
                    html TEXT NOT NULL,
                    text TEXT NOT NULL,
                    excerpt TEXT NOT NULL DEFAULT '',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TRIGGER IF NOT EXISTS update_notes_timestamp 
                AFTER UPDATE ON notes
                BEGIN
                    UPDATE notes SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = NEW.id;
                END;
            `);

			console.log('Database initialized successfully');
			return db;
		} catch (error) {
			console.error('Failed to initialize database:', error);
			db = null;
			throw error;
		} finally {
			isInitializing = false;
			initializationPromise = null;
		}
	})();

	return initializationPromise;
}

export function getDatabase() {
	if (!db) {
		throw new Error('Database not initialized. Call initializeDatabase() first.');
	}
	return db;
}

export function closeDatabase() {
	if (db) {
		console.log('Closing database connection...');
		db.close();
		db = null;
		console.log('Database connection closed');
	}
}

// Optional: Function to check database status
export function isDatabaseInitialized() {
	return db !== null;
}
