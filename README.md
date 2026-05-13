# DSFacile

DSFacile est une application React/Vite pour préparer des déclarations statistiques et fiscales camerounaises. Les modules applicatifs sont intégrés sous `/app`.

## Modules intégrés

- `/app/normal` : DSF normale avec identification contribuable, bilan actif/passif, compte de résultat, contrôles d'équilibre, import CSV, sauvegarde JSON et export XLSX.
- `/app/smt` : DSF système minimal de trésorerie avec recettes encaissées, dépenses payées, contrôle de caisse, import CSV, sauvegarde JSON et export XLSX.
- `/app` : écran d'accueil applicatif permettant de choisir le module.

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

## Structure utile

- `src/pages/DsfHome.tsx` : accueil applicatif intégré.
- `src/pages/DsfWorkspace.tsx` : écran de saisie DSF normale / SMT.
- `src/features/dsf/index.ts` : modèle métier, calculs, validations, stockage et génération XLSX.
- `PRODUCTION_READINESS_AUDIT.md` : audit initial de préparation production.
