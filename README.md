# DSFacile

DSFacile est une application React/Vite pour préparer des déclarations statistiques et fiscales camerounaises. Les modules applicatifs sont intégrés sous `/app`.

## Modules intégrés

- `/app/normal` : DSF normale avec identification contribuable, bilan actif/passif, compte de résultat, contrôles d'équilibre, import CSV, sauvegarde JSON et export XLSX.
- `/app/smt` : DSF système minimal de trésorerie avec recettes encaissées, dépenses payées, contrôle de caisse, import CSV, sauvegarde JSON et export XLSX.
- `/app` : écran d'accueil applicatif permettant de choisir le module.

## Ce que DSFacile n'est pas

- Il n'y a ni compte, ni backend, ni base de données : tout est stocké dans le `localStorage` du
  navigateur. Vider les données du navigateur efface les dossiers ; l'export JSON est le seul moyen
  de les conserver ou de les transférer.
- Les formulaires de contact et de démonstration n'envoient rien par eux-mêmes : ils ouvrent le
  client de messagerie de l'utilisateur sur un e-mail pré-rempli (voir `src/lib/contact.ts`).
- La route `/admin` n'affiche que des données factices et n'a aucune authentification. Elle est
  volontairement limitée au mode développement et absente des builds de production.
- Les offres présentées dans la section Tarifs sont en préparation ; aucune facturation n'est active.

## Limite réglementaire

Les exports XLSX sont des classeurs de préparation et de revue interne. Avant un dépôt réel, les feuilles doivent être validées contre les modèles officiels et les contraintes de dépôt DGI applicables à l'exercice fiscal.

## Démarrage

```sh
npm install
npm run dev
```

## Scripts

```sh
npm run build
npm run lint
npm run typecheck
npm run preview
```

## Déploiement

DSFacile est une single-page application : toutes les routes doivent être réécrites vers
`index.html`, sinon un accès direct à `/app/normal` renvoie une 404.

- **Vercel** : `vercel.json` est fourni à la racine.
- **Netlify / Cloudflare Pages** : `public/_redirects` est copié dans `dist/` au build.
- **nginx** : `location / { try_files $uri $uri/ /index.html; }`
- **Apache** : régle de réécriture `RewriteRule ^ index.html [L]` pour les chemins non existants.

Les coordonnées de contact (e-mail, téléphones, ville) sont centralisées dans `src/lib/contact.ts` :
les formulaires et le pied de page les y lisent.

## Structure utile

- `src/pages/DsfHome.tsx` : accueil applicatif intégré.
- `src/pages/DsfWorkspace.tsx` : écran de saisie DSF normale / SMT.
- `src/features/dsf/index.ts` : modèle métier, calculs, validations, stockage et génération XLSX.
- `PRODUCTION_READINESS_AUDIT.md` : audit initial de préparation production.
