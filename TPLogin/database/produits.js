import { getDb } from './connexion';
const PRODUITS_DE_DEPART = [
 ['Clavier mécanique', 'Informatique', 79.9, 12],
 ['Souris sans fil', 'Informatique', 24.5, 40],
 ['Écran 24 pouces', 'Informatique', 149, 7],
 ['Casque audio', 'Informatique', 59, 15],
 ['Webcam HD', 'Informatique', 39.9, 0],
 ['Disque SSD 1 To', 'Informatique', 89, 22],
 ['Lampe de bureau', 'Maison', 29.9, 18],
 ['Cafetière', 'Maison', 49, 9],
 ['Bouilloire', 'Maison', 34.5, 25],
 ['Aspirateur robot', 'Maison', 199, 4],
 ['Plaid en laine', 'Maison', 35, 0],
 ['Set de 6 verres', 'Maison', 18, 30],
 ['Tapis de yoga', 'Sport', 22, 33],
 ['Haltères 2 x 5 kg', 'Sport', 39, 11],
 ['Corde à sauter', 'Sport', 9.9, 50],
 ['Gourde isotherme', 'Sport', 19.9, 27],
 ['Montre sportive', 'Sport', 129, 6],
 ['Sac de sport', 'Sport', 44, 14],
 ['Apprendre React Native', 'Livres', 34.9, 20],
 ['JavaScript moderne', 'Livres', 29.9, 16],
 ['Algorithmes en pratique', 'Livres', 42, 8],
 ['Bases de données SQL', 'Livres', 31.5, 13],
 ['Gestion de projet agile', 'Livres', 27, 0],
 ['Clean Code', 'Livres', 38, 10],
];
export const initProduits = async () => {
 const db = await getDb();
 await db.execAsync(`
 CREATE TABLE IF NOT EXISTS produits (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nom TEXT NOT NULL,
 categorie TEXT NOT NULL,
 prix REAL NOT NULL,
 stock INTEGER NOT NULL DEFAULT 0
 );
 `);
 // On ne remplit la table que si elle est vide
 const { n } = await db.getFirstAsync('SELECT COUNT(*) AS n FROM produits');
 if (n > 0) return;
 await db.withTransactionAsync(async () => {
 for (const [nom, categorie, prix, stock] of PRODUITS_DE_DEPART) {
 await db.runAsync(
 'INSERT INTO produits (nom, categorie, prix, stock) VALUES (?, ?, ?, ?)',
 nom, categorie, prix, stock
 );
 }
 });
};

const FILTRE = 'nom LIKE ? AND (? IS NULL OR categorie = ?)';

const parametresFiltre = (recherche, categorie) => [
 `%${recherche.trim()}%`,
 categorie,
 categorie,
];

export const listerProduits = async ({
 recherche = '',
 categorie = null,
 limite = -1,
 decalage = 0,
} = {}) => {
 const db = await getDb();
 return db.getAllAsync(
 `SELECT id, nom, categorie, prix, stock FROM produits
  WHERE ${FILTRE}
  ORDER BY nom, id
  LIMIT ? OFFSET ?`,
 ...parametresFiltre(recherche, categorie),
 limite,
 decalage
 );
};

export const compterProduits = async ({ recherche = '', categorie = null } = {}) => {
 const db = await getDb();
 const { n } = await db.getFirstAsync(
 `SELECT COUNT(*) AS n FROM produits WHERE ${FILTRE}`,
 ...parametresFiltre(recherche, categorie)
 );
 return n;
};

export const listerCategories = async () => {
 const db = await getDb();
 const lignes = await db.getAllAsync(
 'SELECT DISTINCT categorie FROM produits ORDER BY categorie'
 );
 return lignes.map((ligne) => ligne.categorie);
};

export const insererProduit = async (nom, categorie, prix, stock) => {
 const db = await getDb();
 const resultat = await db.runAsync(
 'INSERT INTO produits (nom, categorie, prix, stock) VALUES (?, ?, ?, ?)',
 nom, categorie, prix, stock
 );
 return resultat.lastInsertRowId;
};