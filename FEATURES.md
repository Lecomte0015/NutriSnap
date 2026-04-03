# NutriSnap - Fonctionnalités

> Application de coaching nutritionnel IA avec analyse de repas par photo

---

## ✅ Fonctionnalités Établies

### 🔐 Authentification
- [x] Page d'accueil (Welcome screen)
- [x] Inscription avec email/mot de passe
- [x] Connexion
- [x] Mot de passe oublié
- [x] Gestion de session avec Supabase Auth

### 👤 Profil Utilisateur
- [x] Création de profil lors de l'onboarding
- [x] Affichage des informations du profil
- [x] Page de modification du profil
- [x] Upload de photo de profil vers Supabase Storage
- [ ] ⚠️ Sauvegarde du profil (en attente de mise à jour BDD - colonnes `first_name`, `last_name`, `photo_url`)

### 🎯 Onboarding
- [x] Saisie du prénom
- [x] Sélection de l'objectif (perte de poids, maintien, prise de masse)
- [x] Saisie de l'âge
- [x] Saisie du poids
- [x] Saisie de la taille
- [x] Calcul automatique des calories journalières
- [x] Sélection de la langue (FR, DE, IT)

### 📸 Analyse de Repas
- [x] Prise de photo via caméra
- [x] Envoi de l'image à l'API Claude (Vision)
- [x] Analyse nutritionnelle complète :
  - Identification des aliments
  - Calcul des calories
  - Répartition des macronutriments (protéines, glucides, lipides)
  - Score nutritionnel
  - Feedback personnalisé
- [x] Affichage des résultats d'analyse
- [x] Sauvegarde des repas en base de données

### 📊 Tableau de Bord
- [x] Affichage du résumé journalier
- [x] Anneau de progression des calories
- [x] Barres de progression des macros
- [x] Liste des repas du jour
- [x] Compteur de streak (série de jours consécutifs)
- [x] Mascotte animée avec messages contextuels
- [x] Pull-to-refresh
- [x] Graphique hebdomadaire des calories (WeeklyChart)

### 🐾 Mascotte
- [x] Composant SVG animé avec React Native Reanimated
- [x] Différentes humeurs (idle, happy, excited, warning, sad, thinking)
- [x] Animation de respiration permanente (micro-animation idle)
- [x] Transitions fluides entre les états
- [x] Messages personnalisés selon le contexte
- [x] Hook `useMascotController` pour contrôle intelligent
- [x] Réaction automatique au score nutritionnel
- [x] Délai naturel avant réaction (200-500ms)
- [x] Retour automatique vers idle après 4 secondes

### 🌍 Internationalisation
- [x] Support multilingue (Français, Allemand, Italien)
- [x] Sélection de la langue dans l'onboarding
- [x] Traductions des interfaces principales

### 💳 Abonnements (UI)
- [x] Page Paywall avec plans d'abonnement
- [x] Affichage des avantages Premium
- [ ] ⚠️ Intégration RevenueCat (actuellement UI seulement)

---

## 🔜 Fonctionnalités À Venir

### Priorité Haute (P1)
- [ ] **Intégration RevenueCat** - Gestion des abonnements réels
- [ ] **Historique du poids** - Suivi de l'évolution avec graphique
- [ ] **Correction de la mise à jour du profil** - Après exécution du script SQL

### Priorité Moyenne (P2)
- [ ] **Mode sombre** - Thème alternatif pour l'application
- [ ] **Détail d'un repas** - Vue détaillée lors du clic dans l'historique
- [ ] **Statistiques avancées** - Moyennes hebdomadaires et mensuelles

### Priorité Basse (P3)
- [ ] **Notifications/Rappels** - Rappels de repas personnalisables
- [ ] **Export des données** - Export PDF ou CSV des statistiques
- [ ] **Objectifs personnalisés** - Définir des objectifs par nutriment
- [ ] **Recettes suggérées** - Suggestions basées sur les macros restants

---

## 🏗️ Architecture Technique

### Frontend
- **Framework**: Expo (React Native)
- **Navigation**: Expo Router (file-based routing)
- **État**: Zustand
- **i18n**: i18n-js
- **UI**: Composants React Native natifs

### Backend
- **Framework**: FastAPI (Python)
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Stockage**: Supabase Storage (bucket "photo")
- **IA**: API Anthropic Claude (analyse d'images)

### Intégrations
- **Supabase** - Auth, Database, Storage
- **Claude API** - Analyse visuelle des repas
- **RevenueCat** - Gestion des abonnements (à finaliser)

---

## 📝 Notes

### Actions requises par l'utilisateur
1. Exécuter le script SQL pour ajouter les colonnes manquantes dans la table `profiles`
2. Configurer RevenueCat avec les clés API appropriées

### Variables d'environnement requises
```
# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key

# Frontend (.env)
EXPO_PUBLIC_BACKEND_URL=your_backend_url
```

---

*Dernière mise à jour: Juin 2025*
