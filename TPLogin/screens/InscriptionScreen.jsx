 import { useState, useEffect } from 'react';
import {
 View, Text, TextInput, Switch, Pressable, ScrollView,
 KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './InscriptionStyles';
import { validerFormulaire } from '../utils/validation';
import { initDb, insererUtilisateur, listerUtilisateurs } from '../database';
const FORMULAIRE_VIDE = {
 nom: '', prenom: '', email: '', telephone: '', mdp: '', confirmation: '',
};
export const InscriptionScreen = () => {
 const [form, setForm] = useState(FORMULAIRE_VIDE);
 const [newsletter, setNewsletter] = useState(false);
 const [cgu, setCgu] = useState(false);
 const [erreurs, setErreurs] = useState({});
 useEffect(() => {
 initDb().catch((e) => console.log('Erreur init base', e));
 }, []);
 const maj = (champ, valeur) => setForm((f) => ({ ...f, [champ]: valeur }));
 const valider = () => {
 const e = validerFormulaire(form, cgu);
 setErreurs(e);
 return Object.keys(e).length === 0;
 };
 const envoyer = async () => {
 if (!valider()) return;
 try {
 await insererUtilisateur({ ...form, newsletter, cgu });
 Alert.alert('Inscription réussie', `Bienvenue ${form.prenom} ${form.nom} !`);
 console.log(await listerUtilisateurs());
 setForm(FORMULAIRE_VIDE);
 setNewsletter(false);
 setCgu(false);
 setErreurs({});
 } catch (e) {
 if (String(e.message).includes('UNIQUE')) {
 setErreurs({ email: 'Cet email est déjà utilisé' });
 } else {
 Alert.alert('Erreur', "Impossible d'enregistrer l'utilisateur");
 }
 console.log(e);
 }
 };
 return (
 <SafeAreaView style={styles.safe}>
 <KeyboardAvoidingView
 style={{ flex: 1 }}
 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
 >
 <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
 <View style={styles.carte}>
 <Text style={styles.titre}>Créer un compte</Text>
 <View style={styles.groupe}>
 <Text style={styles.label}>Nom</Text>
 <TextInput
 style={[styles.champ, erreurs.nom && styles.champErreur]}
 placeholder="Dupont"
 placeholderTextColor="#9CA3AF"
 autoCapitalize="words"
 value={form.nom}
 onChangeText={(t) => maj('nom', t)}
 />
 {erreurs.nom && <Text style={styles.erreur}>{erreurs.nom}</Text>}
 </View>
 <View style={styles.groupe}>
 <Text style={styles.label}>Prénom</Text>
 <TextInput
 style={[styles.champ, erreurs.prenom && styles.champErreur]}
 placeholder="Marie"
 placeholderTextColor="#9CA3AF"
 autoCapitalize="words"
 value={form.prenom}
 onChangeText={(t) => maj('prenom', t)}
 />
 {erreurs.prenom && <Text style={styles.erreur}>{erreurs.prenom}</Text>}
 </View>
 <View style={styles.groupe}>
 <Text style={styles.label}>Email</Text>
 <TextInput
 style={[styles.champ, erreurs.email && styles.champErreur]}
 placeholder="marie@mail.com"
 placeholderTextColor="#9CA3AF"
 keyboardType="email-address"
 autoCapitalize="none"
 autoCorrect={false}
 value={form.email}
 onChangeText={(t) => maj('email', t)}
 />
 {erreurs.email && <Text style={styles.erreur}>{erreurs.email}</Text>}
 </View>
 <View style={styles.groupe}>
 <Text style={styles.label}>Téléphone (facultatif)</Text>
 <TextInput
 style={[styles.champ, erreurs.telephone && styles.champErreur]}
 placeholder="06 12 34 56 78"
 placeholderTextColor="#9CA3AF"
 keyboardType="phone-pad"
 value={form.telephone}
 onChangeText={(t) => maj('telephone', t)}
 />
 {erreurs.telephone && <Text style={styles.erreur}>{erreurs.telephone}</Text>}
 </View>
 <View style={styles.groupe}>
 <Text style={styles.label}>Mot de passe</Text>
 <TextInput
 style={[styles.champ, erreurs.mdp && styles.champErreur]}
 placeholder="••••••"
 placeholderTextColor="#9CA3AF"
 secureTextEntry
 value={form.mdp}
 onChangeText={(t) => maj('mdp', t)}
 />
 {erreurs.mdp && <Text style={styles.erreur}>{erreurs.mdp}</Text>}
 </View>
 <View style={styles.groupe}>
 <Text style={styles.label}>Confirmer le mot de passe</Text>
 <TextInput
 style={[styles.champ, erreurs.confirmation && styles.champErreur]}
 placeholder="••••••"
 placeholderTextColor="#9CA3AF"
 secureTextEntry
 value={form.confirmation}
 onChangeText={(t) => maj('confirmation', t)}
 />
 {erreurs.confirmation && <Text style={styles.erreur}>{erreurs.confirmation}</Text>}
 </View>
 <View style={styles.ligneSwitch}>
 <Text style={styles.libelle}>Recevoir la newsletter</Text>
 <Switch
  value={newsletter}
  onValueChange={setNewsletter}
  trackColor={{ false: '#D6D3D1', true: '#FDBA74' }}
  thumbColor={newsletter ? '#C2410C' : '#F5F5F4'}
 />
 </View>
 <View style={styles.ligneSwitch}>
 <Text style={styles.libelle}>J&apos;accepte les CGU</Text>
 <Switch
  value={cgu}
  onValueChange={setCgu}
  trackColor={{ false: '#D6D3D1', true: '#FDBA74' }}
  thumbColor={cgu ? '#C2410C' : '#F5F5F4'}
 />
 </View>
 {erreurs.cgu && <Text style={styles.erreur}>{erreurs.cgu}</Text>}
 <Pressable
 onPress={envoyer}
 style={({ pressed }) => [styles.bouton, pressed && styles.boutonPresse]}
 >
 <Text style={styles.boutonTexte}>S&apos;inscrire</Text>
 </Pressable>
 </View>
 </ScrollView>
 </KeyboardAvoidingView>
 </SafeAreaView>
 );
};
