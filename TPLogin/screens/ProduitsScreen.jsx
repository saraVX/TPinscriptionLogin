import { useCallback, useEffect, useRef, useState } from 'react';
import {ActivityIndicator,FlatList,Pressable,Text,TextInput,View,} from 'react-native';
 
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './ProduitsStyles';
import {
 initDb,
 insererProduit,
 compterProduits,
 listerCategories,
 listerProduits,
} from '../database';

const TAILLE_PAGE = 10;

const formaterPrix = (prix) => prix.toFixed(2).replace('.', ',') + ' €';

const CarteProduit = ({ produit }) => (
 <View style={styles.carte}>
  <View style={styles.carteGauche}>
   <Text style={styles.nom}>{produit.nom}</Text>
   <Text style={styles.categorie}>{produit.categorie}</Text>
  </View>
  <View>
   <Text style={styles.prix}>{formaterPrix(produit.prix)}</Text>
   <Text style={[styles.stock, produit.stock === 0 && styles.rupture]}>
    {produit.stock === 0 ? 'En rupture' : `Stock : ${produit.stock}`}
   </Text>
  </View>
 </View>
);

const Separateur = () => <View style={styles.separateur} />;

export const ProduitsScreen = ({ utilisateur, onDeconnexion }) => {
 const [produits, setProduits] = useState([]);
 const [total, setTotal] = useState(0);
 const [recherche, setRecherche] = useState('');
 const [categorie, setCategorie] = useState(null);
 const [categories, setCategories] = useState([null]);
 const [version, setVersion] = useState(0);
 const [chargement, setChargement] = useState(true);
 const [chargementPlus, setChargementPlus] = useState(false);
 const [rafraichissement, setRafraichissement] = useState(false);
 const [erreur, setErreur] = useState(null);
 const [erreurCategories, setErreurCategories] = useState(null);
 const [erreurPlus, setErreurPlus] = useState(null);
 const generation = useRef(0);

 const recharger = useCallback(() => {
  setVersion((valeur) => valeur + 1);
 }, []);

 const reessayer = useCallback(() => {
  setChargement(true);
  setErreur(null);
  recharger();
 }, [recharger]);

 const rafraichir = useCallback(() => {
  setRafraichissement(true);
  recharger();
 }, [recharger]);

 const ajouter = useCallback(async () => {
  try {
   await insererProduit(`Nouveau produit ${Date.now() % 1000}`, 'Maison', 9.9, 5);
   recharger();
  } catch (error) {
   console.error("Erreur lors de l'ajout du produit :", error);
   setErreur("Impossible d'ajouter le produit.");
  }
 }, [recharger]);

 const chargerPlus = useCallback(async () => {
  if (chargementPlus || produits.length >= total) return;
  const lecture = generation.current;
  setChargementPlus(true);
  setErreurPlus(null);
  try {
   const suite = await listerProduits({
    recherche,
    categorie,
    limite: TAILLE_PAGE,
    decalage: produits.length,
   });
   if (lecture !== generation.current) return;
   setProduits((actuels) => [...actuels, ...suite]);
  } catch (error) {
   console.error('Erreur lors du chargement des produits suivants :', error);
   if (lecture === generation.current) {
    setErreurPlus('Impossible de charger la suite des produits.');
   }
  } finally {
   if (lecture === generation.current) setChargementPlus(false);
  }
 }, [chargementPlus, produits.length, total, recherche, categorie]);

 useEffect(() => {
  let actuel = true;
  const chargerCategories = async () => {
   try {
    await initDb();
    const liste = await listerCategories();
    if (actuel) setCategories([null, ...liste]);
   } catch (error) {
    console.error('Erreur lors du chargement des catégories :', error);
    if (actuel) setErreurCategories('Impossible de charger les catégories.');
   }
  };
  chargerCategories();

  return () => {
   actuel = false;
  };
 }, []);

 useEffect(() => {
  let actuel = true;
  generation.current += 1;
  const lire = async () => {
   try {
    await initDb();
    const [lignes, nombre] = await Promise.all([
     listerProduits({
      recherche,
      categorie,
      limite: TAILLE_PAGE,
      decalage: 0,
     }),
     compterProduits({ recherche, categorie }),
    ]);
    if (actuel) {
     setProduits(lignes);
     setTotal(nombre);
     setErreur(null);
    }
   } catch (error) {
    console.error('Erreur lors du chargement des produits :', error);
    if (actuel) setErreur('Impossible de charger les produits.');
   } finally {
    if (actuel) {
     setChargement(false);
     setRafraichissement(false);
    }
   }
  };
  lire();

  return () => {
   actuel = false;
  };
 }, [recherche, categorie, version]);

 if (chargement) {
  return (
   <SafeAreaView style={[styles.ecran, styles.centre]}>
    <ActivityIndicator size="large" color="#2563EB" />
   </SafeAreaView>
  );
 }

 if (erreur) {
  return (
   <SafeAreaView style={[styles.ecran, styles.centre]}>
    <Text style={styles.messageErreur}>{erreur}</Text>
    <Pressable
     onPress={reessayer}
     style={({ pressed }) => [styles.bouton, pressed && styles.boutonPresse]}
    >
     <Text style={styles.boutonTexte}>Réessayer</Text>
    </Pressable>
   </SafeAreaView>
  );
 }

 return (
  <SafeAreaView style={styles.ecran}>
   <View style={styles.fixe}>
    <View style={styles.ligneTitre}>
     <View>
      <Text style={styles.titre}>Produits</Text>
      <Text style={styles.sousTitre}>{produits.length} / {total} produit(s)</Text>
     </View>
     <Pressable onPress={onDeconnexion}>
      <Text style={styles.lienDeconnexion}>Se déconnecter</Text>
     </Pressable>
    </View>
    <Text style={styles.bonjour}>
     Connecté : {utilisateur.prenom} {utilisateur.nom}
    </Text>
    <TextInput
     value={recherche}
     onChangeText={setRecherche}
     placeholder="Rechercher un produit"
     placeholderTextColor="#9CA3AF"
     autoCorrect={false}
     style={styles.champRecherche}
     returnKeyType="search"
    />
    {erreurCategories && (
     <Text style={styles.messageErreur}>{erreurCategories}</Text>
    )}
   </View>
   <FlatList
    horizontal
    showsHorizontalScrollIndicator={false}
    data={categories}
    extraData={categorie}
    keyExtractor={(option) => option ?? 'toutes'}
    style={styles.listePuces}
    contentContainerStyle={styles.puces}
    keyboardShouldPersistTaps="handled"
    renderItem={({ item: option }) => (
     <Pressable
      onPress={() => setCategorie(option)}
      style={[styles.puce, categorie === option && styles.puceActive]}
     >
      <Text style={[styles.puceTexte, categorie === option && styles.puceTexteActive]}>
        {option ?? 'Toutes'}
      </Text>
     </Pressable>
    )}
   />
   <FlatList
    showsVerticalScrollIndicator={false}
    data={produits}
    refreshing={rafraichissement}
    onRefresh={rafraichir}
    keyExtractor={(item) => String(item.id)}
    contentContainerStyle={styles.liste}
    ItemSeparatorComponent={Separateur}
    onEndReached={chargerPlus}
    onEndReachedThreshold={0.5}
    ListFooterComponent={
     erreurPlus
      ? (
       <View style={styles.pied}>
        <Text style={styles.messageErreur}>{erreurPlus}</Text>
        <Pressable onPress={chargerPlus}>
         <Text style={styles.lienDeconnexion}>Réessayer</Text>
        </Pressable>
       </View>
      )
      : chargementPlus
       ? <ActivityIndicator style={styles.pied} color="#2563EB" />
       : null
    }
    ListHeaderComponent={
     <View style={styles.entete}>
      <Pressable
       onPress={ajouter}
       style={({ pressed }) => [
        styles.bouton,
        styles.boutonAjout,
        pressed && styles.boutonPresse,
       ]}
      >
       <Text style={styles.boutonTexte}>+ Ajouter un produit</Text>
      </Pressable>
     </View>
    }
    ListEmptyComponent={
     <Text style={styles.vide}>
      {recherche.trim() !== '' || categorie !== null
       ? 'Aucun produit ne correspond'
       : 'Aucun produit à afficher'}
     </Text>
    }
    renderItem={({ item }) => <CarteProduit produit={item} />}
    keyboardShouldPersistTaps="handled"
   />
  </SafeAreaView>
 );
};
