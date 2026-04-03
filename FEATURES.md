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

### 🐾 Mascotte Animée
- [x] Composant SVG animé avec React Native Reanimated
- [x] 6 humeurs : idle, happy, excited, warning, sad, thinking
- [x] Animation de respiration permanente (micro-animation idle)
- [x] Transitions fluides entre les états à 60fps
- [x] Expressions faciales dynamiques (sourcils, bouche, yeux)
- [x] Éléments visuels : joues roses, trous de fromage, reflets
- [x] Effets spéciaux : larme (sad), bulles de réflexion (thinking), dents (excited)
- [x] Hook `useMascotController` pour contrôle intelligent
- [x] Réaction automatique au score nutritionnel
- [x] Délai naturel avant réaction (200-500ms)
- [x] Retour automatique vers idle après 4 secondes

### 🏆 Gamification (NOUVEAU)
- [x] **Système de niveaux** - Débutant → Légende (6 niveaux)
- [x] **Badges/Achievements** - 8 badges à débloquer
  - Premier Pas (1er scan)
  - Photographe Culinaire (10 scans)
  - Expert Scanner (50 scans)
  - Sur la Bonne Voie (3 jours streak)
  - Semaine Parfaite (7 jours streak)
  - Mois Légendaire (30 jours streak)
  - Mangeur Sain (score moyen > 8)
  - Économiseur (1000 kcal économisées)
- [x] **Défis hebdomadaires** - Challenges avec récompenses XP
- [x] **Progression XP** - Barre de progression avec niveaux
- [x] **Page Mes Succès** - Vue complète des achievements

### 💬 Social Proof (NOUVEAU)
- [x] **Compteur social** - Utilisateurs, repas analysés, note moyenne
- [x] **Témoignages** - Carrousel avec photos et résultats
- [x] **Résultats avant/après** - Poids perdu et durée

### 🤖 Coach IA (NOUVEAU - Premium)
- [x] **Chat interactif** avec la mascotte
- [x] **Conseils nutritionnels** personnalisés
- [x] **Réponses contextuelles** (perte de poids, muscles, snacks, etc.)
- [x] **Interface moderne** style messagerie
- [x] **Mode thinking** pendant la réponse

### 💳 Paywall Optimisé (NOUVEAU)
- [x] **Comparaison Free vs Premium** - Tableau visuel
- [x] **3 plans** : Gratuit, Mensuel (9.99€), Annuel (59.99€)
- [x] **Prix psychologique** - "0.33€/jour" au lieu de "9.99€/mois"
- [x] **Badge économies** - "Économisez 50%" sur l'annuel
- [x] **Garantie satisfait ou remboursé** - 14 jours visible
- [x] **Badges de sécurité** - Paiement sécurisé, Apple Pay/Google Pay
- [x] **Témoignages intégrés** - Social proof sur le paywall
- [x] **Animation CTA** - Bouton avec gradient animé

### 🌍 Internationalisation
- [x] Support multilingue (Français, Allemand, Italien)
- [x] Sélection de la langue dans l'onboarding
- [x] Traductions des interfaces principales

---

## 🔜 Fonctionnalités À Venir

### Priorité Haute (P1)
- [ ] **Intégration RevenueCat** - Gestion des abonnements réels
- [ ] **Historique du poids** - Suivi de l'évolution avec graphique
- [ ] **Correction de la mise à jour du profil** - Après exécution du script SQL
- [ ] **Notifications push** - Rappels de repas et motivation

### Priorité Moyenne (P2)
- [ ] **Mode sombre** - Thème alternatif pour l'application
- [ ] **Détail d'un repas** - Vue détaillée lors du clic dans l'historique
- [ ] **Statistiques avancées** - Moyennes hebdomadaires et mensuelles
- [ ] **Scan de code-barres** - Pour les produits emballés
- [ ] **Suggestions de recettes** - Basées sur les macros restants

### Priorité Basse (P3)
- [ ] **Export PDF** - Rapport mensuel pour médecin/nutritionniste
- [ ] **Mode hors-ligne** - Scanner sans internet
- [ ] **Objectifs personnalisés** - Définir des objectifs par nutriment
- [ ] **Leaderboard** - Classement anonyme par streak/score

---

## 🏗️ Architecture Technique

### Frontend
- **Framework**: Expo (React Native)
- **Navigation**: Expo Router (file-based routing)
- **État**: Zustand
- **Animations**: React Native Reanimated
- **i18n**: i18n-js
- **UI**: Composants React Native natifs + SVG

### Backend
- **Framework**: FastAPI (Python)
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Stockage**: Supabase Storage (bucket "photo")
- **IA**: API Anthropic Claude (analyse d'images)

### Composants Créés
- `MascotAnimated.tsx` - Mascotte SVG animée
- `Testimonials.tsx` - Carrousel de témoignages
- `SocialProof.tsx` - Compteurs sociaux
- `BadgeCard.tsx` - Carte de badge
- `LevelProgress.tsx` - Barre de progression niveau
- `WeeklyChallenge.tsx` - Carte de défi hebdomadaire
- `WeeklyChart.tsx` - Graphique hebdomadaire

### Hooks Créés
- `useMascotController.ts` - Contrôle intelligent de la mascotte

### Pages Créées
- `/coach.tsx` - Chat avec le coach IA
- `/achievements.tsx` - Page des succès et badges
- `/paywall-new.tsx` - Paywall optimisé pour conversion

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
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

*Dernière mise à jour: Juin 2025*
