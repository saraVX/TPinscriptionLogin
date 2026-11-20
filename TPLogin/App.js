import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './screens/LoginScreen';
import { InscriptionScreen } from './screens/InscriptionScreen';
import { ProduitsScreen } from './screens/ProduitsScreen';
import styles from './AppStyles';
import { initDb } from './database';

export default function App() {
 const [ecran, setEcran] = useState('login');
 const [utilisateur, setUtilisateur] = useState(null);

 useEffect(() => {
  initDb().catch((error) => {
   console.log('Erreur initialisation base', error);
  });
 }, []);

 if (utilisateur) {
  return (
   <SafeAreaProvider>
    <StatusBar style="light" />
    <ProduitsScreen
     utilisateur={utilisateur}
     onDeconnexion={() => setUtilisateur(null)}
    />
   </SafeAreaProvider>
  );
 }

 return (
  <SafeAreaProvider>
   <StatusBar style="light" />
   <View style={styles.racine}>
    <View style={styles.ecran}>
     {ecran === 'login'
      ? <LoginScreen onConnecte={setUtilisateur} />
      : <InscriptionScreen />}
    </View>
    <SafeAreaView edges={['bottom']} style={styles.zoneLien}>
     <Pressable onPress={() => setEcran(ecran === 'login' ? 'inscription' : 'login')}>
      <Text style={styles.lien}>
       {ecran === 'login'
        ? "Pas encore de compte ? S'inscrire"
        : 'Déjà inscrit ? Se connecter'}
      </Text>
     </Pressable>
    </SafeAreaView>
   </View>
  </SafeAreaProvider>
 );
}
