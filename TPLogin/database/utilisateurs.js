import { getDb } from './connexion';
export const insererUtilisateur = async ({
 nom, prenom, email, telephone, mdp, newsletter, cgu,
}) => {
 const db = await getDb();
 const resultat = await db.runAsync(
 `INSERT INTO utilisateurs
 (nom, prenom, email, telephone, mdp, newsletter, cgu)
 VALUES (?, ?, ?, ?, ?, ?, ?)`,
 nom.trim(),
 prenom.trim(),
 email.trim().toLowerCase(),
 telephone || null,
 mdp,
 newsletter ? 1 : 0,
 cgu ? 1 : 0
 );
 return resultat.lastInsertRowId;
};
export const listerUtilisateurs = async () => {
 const db = await getDb();
 return db.getAllAsync(
 `SELECT id, nom, prenom, email, telephone, newsletter, cree_le
 FROM utilisateurs ORDER BY id DESC`
 );
};

// Renvoie l'utilisateur si l'email et le mot de passe correspondent, sinon null
export const verifierConnexion = async (email, mdp) => {
 const db = await getDb();
 return db.getFirstAsync(
 `SELECT id, nom, prenom, email FROM utilisateurs
 WHERE email = ? AND mdp = ?`,
 email.trim().toLowerCase(),
 mdp
 );
};
