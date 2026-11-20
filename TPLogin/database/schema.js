import { getDb } from './connexion';
import { initProduits } from './produits';

let initPromise = null;

const initializeDb = async () => {
 const db = await getDb();
 await db.execAsync(`
 PRAGMA journal_mode = WAL; 
 CREATE TABLE IF NOT EXISTS utilisateurs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nom TEXT NOT NULL,
 prenom TEXT NOT NULL,
 email TEXT NOT NULL UNIQUE,
 telephone TEXT,
 mdp TEXT NOT NULL,
 newsletter INTEGER NOT NULL DEFAULT 0,
 cgu INTEGER NOT NULL DEFAULT 0,
 cree_le TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
 );
 `);
 await initProduits();
};

export const initDb = () => {
 if (!initPromise) {
  initPromise = initializeDb().catch((error) => {
   initPromise = null;
   throw error;
  });
 }
 return initPromise;
};
