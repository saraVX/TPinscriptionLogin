 
import * as SQLite from 'expo-sqlite';

let dbPromise = null;

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('inscription.db');
  }

  const db = await dbPromise;

  return db;
};
