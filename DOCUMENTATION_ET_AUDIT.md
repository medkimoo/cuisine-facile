# Documentation Fonctionnelle & Audit de l'Application CuisineFacile

## 1. Présentation Générale
CuisineFacile est une application web monopage (SPA) de planification de repas collaboratifs. Elle permet aux utilisateurs de gérer des recettes de cuisine, de générer automatiquement des plannings de repas équilibrés, et de consolider des listes de courses interactives. L'application intègre un système de "Foyer" permettant à plusieurs utilisateurs de partager et synchroniser ces données en temps réel.

L'application est construite en React.js, utilise Vite pour le bundling, Tailwind CSS pour le style, et s'appuie sur Supabase (PostgreSQL, Auth, Realtime) pour le backend et l'authentification. L'interface est pensée "Mobile First".

---

## 2. Documentation Fonctionnelle (Fonctionnalités Clés)

L'application est divisée en plusieurs grands écrans et flux utilisateurs :

### 2.1 Authentification (`AuthScreen.jsx`)
- **Connexion / Inscription** : Par email/mot de passe. La création d'un compte demande un prénom complet.
- **Mot de passe oublié** : Envoi d'un lien de réinitialisation par email.
- **SSO Google** : Connexion simplifiée via le fournisseur OAuth Google.
- **Gestion des sessions** : Maintien de la session active via le client Supabase.

### 2.2 Gestion de Foyer (`FoyerScreen.jsx`)
Après inscription, un utilisateur doit rejoindre ou créer un "Foyer" pour utiliser l'application.
- **Créer un foyer** : L'utilisateur nomme son foyer. L'application génère un code d'invitation alphanumérique unique de 8 caractères.
- **Rejoindre un foyer** : L'utilisateur saisit un code d'invitation pour lier son profil à un foyer existant.

### 2.3 Écran Principal (`App.jsx` - Navigation par Onglets)
Une fois dans un foyer, l'utilisateur a accès à 4 onglets principaux via une barre de navigation persistante en bas de l'écran.

#### A. Onglet Planning (Calendrier)
- **Affichage sur 14 jours** : Visualisation des repas du midi et du soir pour les deux prochaines semaines.
- **Génération Intelligente** : Bouton pour générer un planning automatiquement. L'algorithme prend en compte :
  - Le temps de préparation maximum configuré pour le midi et le soir de chaque jour de la semaine.
  - La limitation de la consommation de viande (alerte si > 4 repas avec viande).
  - La variété (évite de proposer la même recette consécutivement).
- **Modification Manuelle** :
  - Changement d'un repas par tirage au sort (parmi les recettes respectant la contrainte de temps).
  - Sélection manuelle d'une recette dans une liste filtrable et cherchable.
- **Mode "Restes" (Cuisiner Double)** : Possibilité de dupliquer un repas du soir pour le lendemain midi (marqué comme "Restes ♻️").
- **Résumé Nutritionnel** : Visualisation du nombre de repas par tag (Viande, Poisson, Végétarien, Léger, Confort) sur les 14 jours.
- **Synchronisation** : Sauvegarde manuelle (`Enregistrer`) et synchronisation temps réel via Supabase.

#### B. Onglet Recettes (Carnet de recettes)
- **Listing & Filtrage** : Liste complète des recettes du foyer. Recherche textuelle (nom, catégorie) et filtrage par tags (Végétarien, Viande, Poisson...) et catégories (Marocaine, Monde, Autre).
- **Ajout / Modification (Formulaire Modal)** :
  - Informations de base : Nom, catégorie, portions, temps (préparation, cuisson).
  - Tags nutritionnels.
  - Ingrédients dynamiques : Nom, quantité, unité, rayon (Fruits & Légumes, Boucherie, etc.).
  - Instructions en texte libre.
- **Suppression** : Bouton de suppression avec confirmation.
- **Optimistic UI / Realtime** : Données initiales par défaut injectées à la création d'un nouveau foyer.

#### C. Onglet Courses (Liste de courses)
- **Consolidation Automatique** : Génération de la liste en fonction des ingrédients requis pour les recettes planifiées dans les 14 prochains jours.
- **Gestion par Rayon** : Les ingrédients sont groupés par rayon (ex: Crèmerie, Épicerie) avec un système de compteurs (ex: 2/5 cochés).
- **Articles Personnalisés** : Ajout manuel d'articles hors recette (préfixés par `[CUSTOM]` en base de données) avec assignation d'un rayon.
- **Checklist** : Cases à cocher interactives synchronisées entre les membres du foyer.

#### D. Onglet Réglages (Settings)
- **Informations Foyer** : Nom et code d'invitation (bouton copier).
- **Configuration des Temps** : Pour chaque jour de la semaine (Dimanche au Samedi), configuration du temps maximum alloué pour cuisiner le midi et le soir (15, 30, 45, 60, 90 minutes). Utilisé par l'algorithme de génération de planning.
- **Compte** : Affichage de l'email et bouton de déconnexion.

---

## 3. Rapport d'Audit & Pistes d'Amélioration

### 3.1 Architecture Technique & Code
* **Composant Monolithique (`App.jsx`)** : Le fichier `App.jsx` fait plus de 800 lignes. Il gère l'état global, la logique métier (algorithme de planning), les appels API Supabase, et le rendu de tous les onglets.
  * *Amélioration* : Découper `App.jsx` en plusieurs composants plus petits (ex: `PlanTab.jsx`, `RecipesTab.jsx`, `ShoppingTab.jsx`, `RecipeForm.jsx`).
  * *Amélioration* : Extraire la logique Supabase et l'état global dans un Context React (ex: `FoyerContext`, `AuthContext`) ou utiliser une librairie de state management (Zustand, Redux) ou de data-fetching (React Query, SWR) pour simplifier les `useEffect` complexes de synchronisation.
* **Gestion des erreurs Supabase** : Beaucoup d'appels à Supabase ne gèrent pas finement les erreurs (silence complet ou simple `console.warn`).
  * *Amélioration* : Implémenter des notifications visuelles (Toasts) pour informer l'utilisateur en cas d'échec de sauvegarde ou de problème réseau.

### 3.2 Fonctionnalités & Logique Métier
* **Génération du Planning** : L'algorithme actuel efface le planning complet sur les 14 jours lorsqu'on clique sur "Générer".
  * *Amélioration* : Permettre de générer le planning uniquement pour les jours vides, ou pouvoir verrouiller (pin) certains repas pour éviter qu'ils ne soient remplacés lors de la génération automatique.
* **Liste de Courses** : Actuellement, la liste est générée statiquement à partir des 14 jours de planning. Si on a déjà acheté les ingrédients pour la semaine 1, ils réapparaissent ou posent problème de réinitialisation.
  * *Amélioration* : Restreindre la génération aux prochains 7 jours (ou permettre de choisir la plage de dates).
  * *Amélioration* : Les articles personnalisés (`[CUSTOM]`) manquent d'édition et de suppression facile (il faut les décocher et ils restent en BDD). Un système clair "vider la liste" ou "supprimer article" est nécessaire.
* **Multiplicateur de Portions** : Les ingrédients sont consolidés, mais il manque une gestion dynamique du nombre de convives au jour le jour (si j'invite des amis mardi soir, je veux doubler les quantités).
  * *Amélioration* : Ajouter un champ "nombre de personnes" par repas planifié, et ajuster la liste de courses proportionnellement aux portions par défaut de la recette.

### 3.3 Expérience Utilisateur (UX) & Interface (UI)
* **Sauvegarde Explicite vs Automatique** : Le système mélange sauvegarde explicite (boutons "Enregistrer") et sauvegarde automatique/optimiste (Realtime, `handleManualReplace`, Toggle de liste de courses).
  * *Amélioration* : Unifier le comportement. Idéalement, privilégier la sauvegarde automatique en arrière-plan avec indicateur "Sauvegardé" discret, et supprimer les boutons "Enregistrer" perturbants.
* **Feedback Visuel de Chargement** : L'ajout/modification de recettes ou le chargement de la liste de courses peut parfois paraître instantané localement mais lent sur Supabase.
  * *Amélioration* : Ajouter des indicateurs de chargement locaux sur les boutons de validation et gérer les états "isSubmitting".
* **Accessibilité (a11y)** : Contraste de certaines couleurs (textes gris clairs) et absence de focus ring visible sur certains éléments custom.
  * *Amélioration* : Améliorer le contraste et s'assurer que l'application est navigable au clavier.

### 3.4 Sécurité & Données
* **Row Level Security (RLS)** : L'audit ne peut pas vérifier directement la configuration Supabase SQL, mais il est crucial de s'assurer que les politiques RLS sur les tables (`foyers`, `recettes`, `planification`, `liste_courses`) empêchent un utilisateur d'un foyer A de lire/modifier les données du foyer B.
* **Validation des Inputs** : La validation côté client est basique (le nom de la recette est obligatoire, mais les autres champs sont très permissifs).
  * *Amélioration* : Utiliser Zod ou Yup pour valider fermement les formulaires avant soumission, particulièrement pour les quantités des ingrédients pour éviter les valeurs non numériques.

## 4. Conclusion
L'application CuisineFacile dispose d'une base fonctionnelle solide et d'un concept clair répondant au besoin quotidien de planification des repas. L'interface mobile-first est propre et moderne. L'effort principal à court terme devrait porter sur le refactoring technique (découpage du composant principal) pour garantir la maintenabilité, suivi de l'amélioration de la gestion de la liste de courses qui représente le cœur de l'usage régulier de l'application.
