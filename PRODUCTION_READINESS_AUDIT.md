# Audit de préparation à la production — DSFacile

Date de l'audit : 2026-05-13

## Conclusion exécutive

Le dépôt contient aujourd'hui une vitrine React/Vite et quelques écrans statiques de connexion et d'administration. Il ne contient pas encore l'application métier nécessaire pour permettre à des entrepreneurs camerounais de déposer leurs états financiers en Système Normal ou en Système Minimal de Trésorerie (SMT), ni de produire une liasse XLSX compatible avec le dépôt fiscal.

Statut recommandé : **non prêt pour la production**. Le projet doit être traité comme un prototype marketing/UI.

## Éléments observés dans le dépôt

- L'application expose seulement quatre routes : accueil, connexion, administration et page 404.
- La page d'accueil assemble des sections marketing : hero, fonctionnalités, fonctionnement, témoignages, prix, appel à l'action, FAQ et pied de page.
- Le formulaire de connexion/inscription empêche le rechargement de page puis écrit uniquement dans la console.
- Le formulaire de contact affiche uniquement un toast de succès local, sans envoi vers une API.
- Le tableau de bord d'administration utilise des statistiques codées en dur et précise que les données devraient venir d'une API dans une vraie application.
- Le projet ne déclare aucune dépendance pour générer ou manipuler des fichiers XLSX, aucun SDK backend, aucune librairie de paiement et aucun moteur de tests.
- La configuration TypeScript est permissive et le README est encore celui généré par Lovable, sans guide d'exploitation ni architecture de production.

## Manques bloquants pour le produit métier

### 1. Parcours utilisateur réel

À ajouter avant production :

- Espace entrepreneur authentifié.
- Création et gestion du profil entreprise : raison sociale, NIU, RCCM, centre des impôts, régime fiscal, exercice, devise, secteur, contacts, mandataires.
- Gestion multi-entreprises et multi-exercices.
- Workflow complet : brouillon, import/saisie, contrôles, corrections, validation, génération XLSX, historique des dépôts.
- Gestion des rôles : propriétaire, collaborateur comptable, cabinet, administrateur, support.
- Pages applicatives dédiées aux DSF Système Normal et aux DSF SMT.

### 2. Authentification, autorisation et sessions

À ajouter avant production :

- Backend d'identité ou fournisseur auth éprouvé.
- Connexion/inscription réelle avec stockage sécurisé des mots de passe ou fédération d'identité.
- Vérification email, réinitialisation de mot de passe, expiration de session, MFA pour administrateurs.
- Protection des routes privées, notamment `/admin`.
- Autorisation par rôle et par entreprise, avec isolation stricte des données entre clients.
- Journal d'audit des connexions et actions sensibles.

### 3. Backend applicatif et persistance

À ajouter avant production :

- API métier versionnée.
- Base de données relationnelle ou équivalent avec migrations.
- Modèle de données pour entreprises, utilisateurs, exercices, balances, écritures/imports, tableaux DSF, validations, exports, abonnements et paiements.
- Stockage sécurisé des fichiers importés et générés.
- Tâches asynchrones pour imports volumineux, génération XLSX et contrôles longs.
- Sauvegardes, restauration, rétention et purge des données.

### 4. Moteur DSF Système Normal et SMT

À ajouter avant production :

- Référentiel officiel et versionné des formulaires DSF applicables au Cameroun.
- Mapping OHADA/SYSCOHADA des comptes vers les rubriques DSF.
- Gestion séparée du Système Normal et du Système Minimal de Trésorerie.
- Calculs des totaux, sous-totaux, reports, soldes, contrôles de cohérence et arrondis.
- Gestion des cas métier : exercices incomplets, pertes, immobilisations, amortissements, stocks, TVA, retenues, personnel, annexes, entreprises sans activité, corrections.
- Mécanisme de mise à jour réglementaire avec traçabilité par année fiscale.
- Validation par expert fiscal/comptable camerounais avant mise en production.

### 5. Import des données comptables

À ajouter avant production :

- Import XLSX/CSV réel avec parseur robuste.
- Modèles d'import téléchargeables.
- Détection d'encodage, séparateurs, devises, colonnes, formats de nombres et dates.
- Prévisualisation des données et écran de correction avant validation.
- Mapping manuel et automatique depuis balances comptables.
- Gestion des erreurs ligne par ligne.
- Support des exports courants des logiciels comptables utilisés localement, après tests réels.

### 6. Génération XLSX compatible dépôt fiscal

À ajouter avant production :

- Dépendance et service de génération XLSX.
- Templates officiels ou reproduits fidèlement, versionnés par exercice/régime.
- Respect des feuilles, cellules, formats, formules, protections, noms d'onglets et contraintes attendues par la plateforme de dépôt.
- Tests automatisés de non-régression sur fichiers générés.
- Validation par dépôt réel ou environnement de test de la DGI, si disponible.
- Téléchargement sécurisé et historisation des versions générées.

### 7. Paiement et facturation

À ajouter avant production :

- Intégration de paiement adaptée au Cameroun : Mobile Money, carte, virement ou fournisseur local.
- Gestion des abonnements, essais, renouvellements, factures, reçus, remboursements et échecs de paiement.
- Contrôle d'accès aux exports selon l'offre souscrite.
- Back-office financier fiable avec rapprochement.

### 8. Administration réelle

À ajouter avant production :

- Authentification et autorisations admin.
- Données réelles côté dashboard.
- Gestion des utilisateurs, entreprises, abonnements, incidents et règles fiscales.
- Outils support : impersonation contrôlée, consultation d'audit, blocage de compte, relance.
- Alertes système basées sur des événements réels.

### 9. Sécurité, confidentialité et conformité

À ajouter avant production :

- Chiffrement en transit HTTPS et chiffrement au repos des données financières.
- Gestion des secrets hors dépôt.
- Politique de sécurité des uploads : taille, type MIME, antivirus, sandboxing, quotas.
- Protection CSRF/XSS, rate limiting, anti-bruteforce et durcissement des en-têtes HTTP.
- Politique de confidentialité, conditions d'utilisation, consentement et mentions légales.
- Plan de réponse incident et procédure de notification client.
- Revue de conformité locale pour données fiscales et financières camerounaises.

### 10. Qualité logicielle et tests

À ajouter avant production :

- Tests unitaires du moteur fiscal et des calculs.
- Tests d'intégration API/base de données.
- Tests end-to-end des parcours : inscription, import, correction, génération XLSX, paiement, administration.
- Tests de compatibilité des fichiers générés.
- Tests d'accessibilité, responsive, performance et sécurité.
- CI obligatoire : lint, typecheck strict, tests, build, audit de dépendances.
- Jeux de données de référence anonymisés et validés par des experts.

### 11. Déploiement, exploitation et observabilité

À ajouter avant production :

- Environnements distincts : développement, staging, production.
- Configuration par variables d'environnement documentées.
- Pipeline de déploiement reproductible.
- Monitoring applicatif, logs structurés, traces, métriques métier et alerting.
- Gestion des erreurs côté client et serveur.
- Sauvegarde/restauration testée.
- Plan de continuité, objectifs RPO/RTO et procédure de rollback.

### 12. Documentation produit et exploitation

À ajouter avant production :

- README remplacé par une documentation projet réelle.
- Guide d'installation, configuration, scripts, architecture et décisions techniques.
- Documentation fonctionnelle DSF Normal/SMT.
- Guide utilisateur entrepreneur.
- Guide support/admin.
- Matrice des exigences réglementaires et de leur couverture par le produit.

## Risques de mise en production en l'état

- Les promesses marketing DSF/XLSX/import/sécurité ne sont pas implémentées.
- Les formulaires de connexion et de contact donnent l'illusion d'un succès sans créer de compte ni envoyer de données.
- La route d'administration est accessible sans protection applicative visible.
- Les données financières sensibles n'ont aucun backend sécurisé, aucune persistance et aucune politique de conservation.
- Aucun élément ne prouve la compatibilité avec les exigences de dépôt fiscal camerounaises.
- Aucun test ne sécurise les calculs, les exports ou les parcours critiques.

## Feuille de route minimale recommandée

1. Cadrer les exigences réglementaires et obtenir des modèles officiels DSF Normal/SMT et XLSX attendus.
2. Concevoir l'architecture backend, la base de données, les rôles et le modèle de sécurité.
3. Implémenter l'authentification, les profils entreprises et les exercices fiscaux.
4. Construire l'import de balances et le moteur de mapping comptable.
5. Implémenter le moteur DSF Normal/SMT avec contrôles de cohérence.
6. Générer les XLSX et valider leur compatibilité sur des cas réels.
7. Ajouter paiement, abonnements et facturation.
8. Industrialiser tests, CI/CD, monitoring, sauvegardes et documentation.
9. Faire une revue sécurité et une validation métier par experts avant ouverture publique.
