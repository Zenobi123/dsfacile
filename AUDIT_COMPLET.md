# Audit complet — DSFacile

Date de l'audit : 2026-07-24
Périmètre : totalité du dépôt (`main` fusionné dans la branche d'audit), branche `claude/project-complete-audit-f5wftp`
Méthode : lecture exhaustive du code, exécution des portes de qualité (`typecheck`, `lint`, `build`, `npm audit`), revue métier OHADA/SYSCOHADA et revue sécurité.

> Cet audit **complète et actualise** `PRODUCTION_READINESS_AUDIT.md` (daté 2026-05-13), désormais **partiellement périmé** : il affirme que l'application métier DSF n'existe pas encore, alors qu'elle a été intégrée depuis (commit `45270ff`, routes `/app`, `/app/normal`, `/app/smt`). Les manques structurels qu'il liste (backend, auth, paiement, conformité DGI) restent en revanche d'actualité.

---

## 1. Résumé exécutif

DSFacile est aujourd'hui une **vitrine marketing + un préparateur de liasse DSF entièrement côté navigateur**, techniquement propre et fonctionnel pour de la saisie et de l'export XLSX « interne ». Les fondamentaux de build sont sains : `typecheck`, `lint` et `build` passent sans erreur.

En revanche, le produit **n'est pas prêt pour une mise en production commerciale** : il n'a ni backend, ni authentification réelle, ni paiement, ni persistance sécurisée, et l'export XLSX n'est **pas** un formulaire officiel DGI malgré les promesses de la page d'accueil. Plusieurs écarts concrets entre le discours marketing et l'implémentation exposent le produit à un risque de réputation et, potentiellement, de conformité.

**Verdict : prototype fonctionnel de préparation interne — NON prêt pour une commercialisation en l'état.**

| Axe | État | Note |
|---|---|---|
| Build / typecheck / lint | ✅ Vert | Bon |
| Architecture front & code métier | ✅ Propre, pur, testable | Bon |
| Sécurité applicative | ❌ Auth factice, `/admin` ouvert | Critique |
| Conformité DGI / OHADA | ⚠️ XLSX non officiel, mapping absent | Élevé |
| Backend / persistance | ❌ Inexistant (localStorage seul) | Critique |
| Cohérence marketing ↔ réalité | ❌ Promesses non tenues | Élevé |
| Tests automatisés | ❌ Aucun | Élevé |
| Dépendances / chaîne de build | ⚠️ 20 vulnérabilités (13 hautes) | Moyen |

---

## 2. Résultats des portes de qualité

Exécutées le 2026-07-24 après `npm install` (398 paquets).

| Commande | Résultat |
|---|---|
| `npm run typecheck` | ✅ Aucune erreur |
| `npm run lint` | ✅ 0 erreur, 7 avertissements (tous dans `src/components/ui/*`, règle `react-refresh/only-export-components` — bruit shadcn/ui inévitable) |
| `npm run build` | ✅ Build réussi en ~8 s, 2585 modules |
| `npm audit` | ⚠️ 20 vulnérabilités : 2 basses, 5 modérées, 13 hautes |

**Nuance importante sur le typecheck** : c'est la porte de correction principale (aucun test), mais TypeScript est configuré en mode **permissif** — `strict: false`, `strictNullChecks: false`, `noImplicitAny: false` (`tsconfig.app.json`, `tsconfig.json`). Le filet de sécurité est donc bien plus faible que ce que « le typecheck valide tout » laisse croire : les erreurs de `null`/`undefined` et les `any` implicites passent.

**Poids des bundles** (piste d'optimisation, non bloquant) :
- `index-*.js` : 391 kB (124 kB gzip)
- `AdminDashboard-*.js` : 405 kB (112 kB gzip) — tiré par `recharts`
- Aucun `manualChunks` ; `recharts` alourdit un écran (admin) qui n'est qu'une maquette.

---

## 3. Points forts

- **Séparation nette** : toute la logique métier est isolée dans `src/features/dsf/index.ts`, pure et sans effet de bord (hors `localStorage` et API navigateur). Facilement testable — il ne manque que les tests.
- **Générateur XLSX zéro-dépendance** : construction manuelle du ZIP + CRC32 + Open XML (`createXlsxBlob`, `zipFiles`, `crc32`). Fonctionne, produit un classeur multi-feuilles valide, et évite une dépendance lourde (`xlsx`/`exceljs`). Belle pièce d'ingénierie.
- **Contrôles de cohérence présents** : équilibre bilan, écart de caisse SMT, champs obligatoires, montants négatifs — `validateDeclaration` bloque l'export en cas d'erreur.
- **Import CSV + sauvegarde/restauration JSON** fonctionnels, avec modèle téléchargeable.
- **Fondation UI solide** : shadcn/ui + Tailwind, responsive, lazy-loading des écrans lourds.
- Le code métier **normalise systématiquement** la déclaration avant tout calcul/export (`normalizeDeclaration`), ce qui évite les dérives d'arrondi et de casse.

---

## 4. Constats détaillés

Sévérité : 🔴 Critique · 🟠 Élevé · 🟡 Moyen · 🔵 Faible

### 4.1 Sécurité & contrôle d'accès

**🔴 C-1 — La route `/admin` n'a aucune protection.**
`App.tsx:30` déclare `<Route path="/admin" element={<AdminDashboard />} />` sans aucun garde. N'importe qui connaissant l'URL accède au tableau de bord. Il est de plus **indexable** : `public/robots.txt` se termine par `User-agent: * / Allow: /`. Aujourd'hui le dashboard n'affiche que des données factices, mais le schéma d'accès est celui d'une faille de production.

**🔴 C-2 — L'« authentification » est une coquille vide.**
`Login.tsx:15-24` : `handleSubmit` fait `console.log('Login submitted')` puis rien. Aucune session, aucun token, aucune vérification. Les boutons Google/Microsoft sont décoratifs. Toute la tarification et l'espace « entreprise » reposent sur une authentification qui n'existe pas.

**🟠 H-1 — Script tiers Lovable chargé sur toutes les pages.**
`index.html:28` charge `https://cdn.gpteng.co/gptengineer.js` en `<script type="module">`. C'est du code tiers exécuté chez chaque visiteur (risque supply-chain + fuite analytique), résidu de l'outil de génération. Les images Open Graph/Twitter pointent aussi vers `lovable.dev` (`index.html:14,18`). À retirer avant toute mise en ligne sous la marque DSFacile.

**🟡 M-1 — Données financières sensibles en clair dans `localStorage`.**
`saveDeclaration` (`features/dsf/index.ts:215`) sérialise NIU, RCCM, montants et écritures en clair sous `dsfacile:<mode>:declaration:v1`. Sur un poste partagé, ces données restent lisibles par tout script du domaine et toute personne ayant accès au navigateur. Acceptable pour un outil local personnel, à proscrire dès qu'on parle « SaaS sécurisé » (cf. écart marketing §4.5).

### 4.2 Navigation & routes cassées

**🟠 H-2 — La barre latérale admin renvoie 5 liens vers des pages 404.**
`AdminLayout.tsx` pointe vers `/admin/users` (l.58), `/admin/subscriptions` (l.64), `/admin/rules` (l.70), `/admin/monitoring` (l.76) et `/logout` (l.89). **Aucune** de ces routes n'existe dans `App.tsx` — elles tombent toutes sur `NotFound`. La navigation admin est donc quasi entièrement morte.

**🟡 M-2 — Boutons sociaux dans un `<form>` sans `type`.**
`Login.tsx:169` et `:178` (Google/Microsoft) sont à l'intérieur du `<form>` (l.64-186) sans attribut `type`. Par défaut un `<button>` dans un formulaire vaut `type="submit"` : cliquer « Google » soumet le formulaire (déclenche `handleSubmit`) au lieu d'ouvrir un flux OAuth. À corriger (`type="button"`), même si le flux OAuth n'existe pas encore.

**🔵 L-1 — `NotFound` : rechargement complet + langue mixte.**
`NotFound.tsx:19` utilise `<a href="/">` (recharge toute l'app au lieu d'un `<Link>` SPA) et mélange l'anglais (« Oops! Page not found », « Return to Home ») dans une interface par ailleurs 100 % francophone.

### 4.3 Logique métier DSF / comptable

**🟠 H-3 — L'export XLSX n'est pas un formulaire officiel DGI.**
`exportDeclarationToXlsx` (`features/dsf/index.ts:236`) produit un classeur « à plat » : feuilles `Meta`, `Identification`, un onglet par nature de ligne, `Synthèse`, `Contrôles`. C'est un **document de préparation/revue interne**, pas la liasse normalisée attendue par la DGI (pas de reprise des cadres officiels, codes de rubriques, tableaux 1 à N, formules réglementaires). Le `README` et `CLAUDE.md` le reconnaissent honnêtement — mais la page d'accueil affirme le contraire (§4.5). Il n'existe **aucun mapping OHADA/SYSCOHADA** compte → rubrique DSF.

**🟡 M-3 — Modèle d'équilibre simplifié, risque de double comptage du résultat.**
`calculateSummary` (`features/dsf/index.ts:158`) calcule `balanceGap = assets − (liabilities + netIncome)` avec `netIncome = revenue − expenses`. Le « résultat » est traité **séparément** des capitaux propres. Or la section `liability` inclut « Capitaux propres » (`sections`, l.71). Si l'utilisateur inscrit le résultat de l'exercice dans les capitaux propres (réflexe comptable normal), il est compté deux fois et le bilan ne s'équilibre jamais. Aucune consigne dans l'UI ne prévient de ce piège. À documenter dans l'interface *a minima*, idéalement à modéliser proprement.

**🔵 L-2 — Tolérances et validations à durcir.**
- L'écart d'équilibre toléré est `> 1` XAF (l.190) : correct, mais les montants sont arrondis à l'entier (`safeAmount`), donc la tolérance n'apporte presque rien.
- `fiscalYear` et `previousFiscalYear` ne sont pas contrôlés l'un par rapport à l'autre (N-1 pourrait être ≥ N).
- En SMT, la colonne « N-1 » est importée depuis le CSV mais désactivée à la saisie (`DsfWorkspace.tsx:205`) : incohérence mineure entre import et UI.

### 4.4 Qualité logicielle & outillage

**🟠 H-4 — Aucun test automatisé.**
Cœur métier (calculs d'équilibre, écart de caisse, parsing CSV, génération XLSX) sans un seul test. C'est le maillon le plus rentable à corriger : la logique de `features/dsf/index.ts` est pure et se teste sans navigateur (Vitest). Un jeu de cas SYSCOHADA validé par un expert sécuriserait durablement les calculs.

**🟠 H-5 — 20 vulnérabilités de dépendances (13 hautes).**
`npm audit` remonte `rollup`, `postcss`, `lodash`, `minimatch`, `picomatch`, `nanoid`, `yaml`. Ce sont **toutes des dépendances de build/dev transitives** (dont plusieurs tirées par `lovable-tagger`), pas du code expédié au navigateur — le risque runtime direct est donc faible, mais le risque chaîne de build (ReDoS, path traversal `rollup`, pollution de prototype `lodash`) est réel en CI. `npm audit fix` en corrige une partie sans casse majeure attendue.

**🟡 M-4 — Deux lockfiles concurrents.**
`bun.lockb` **et** `package-lock.json` coexistent. Selon l'outil utilisé (bun vs npm), les versions résolues divergent → builds non reproductibles. Choisir un gestionnaire unique et supprimer l'autre lockfile.

**🟡 M-5 — Configuration TypeScript permissive.**
`strict`/`strictNullChecks`/`noImplicitAny` désactivés (§2). Puisque le typecheck est la seule porte de correction, la relâcher revient à saboter le filet. Réactiver `strict` progressivement.

**🔵 L-3 — Pas de garde-fou d'exécution.**
Aucun *error boundary* React : une erreur de rendu ou l'échec de chargement d'un chunk lazy (`React.lazy`) produit un écran blanc sans message. `console.log`/`console.error` de debug laissés en production (`Login.tsx:19,22`, `NotFound.tsx:8`).

### 4.5 Écart marketing ↔ réalité

C'est l'axe le plus sensible pour un cabinet qui engage sa réputation.

**🟠 H-6 — Promesses de la page d'accueil non tenues.**
`FeaturesSection.tsx` annonce :
- « Génération automatique des DSF **conformes aux modèles officiels de la DGI** » → faux (§4.3, H-3).
- « Vos données financières sont **chiffrées et sécurisées, avec un accès strictement contrôlé** » → faux : localStorage en clair, aucune auth (C-1, C-2, M-1).

**🟠 H-7 — Offres tarifaires sans fonctionnalité sous-jacente.**
`PricingSection.tsx` vend des forfaits 50 000 / 125 000 F CFA/an et « Enterprise » avec : multi-entreprises, archivage illimité, support prioritaire, **API d'intégration**, paiement. Aucune de ces briques n'existe : pas de comptes, pas de multi-société (une seule déclaration par mode en localStorage), pas de facturation, pas d'API. Encaisser sur ces promesses exposerait à un risque contractuel.

**🟡 M-6 — Formulaires « fantômes ».**
`ContactForm.tsx:23-30` affiche un toast « Message envoyé » sans **aucun** envoi réseau. Le formulaire de connexion idem. L'utilisateur croit avoir été entendu alors que rien n'est transmis.

---

## 5. Synthèse priorisée

| ID | Constat | Sévérité | Effort | Priorité |
|---|---|---|---|---|
| C-1 | `/admin` non protégé + indexable | 🔴 | Faible | P0 |
| C-2 | Authentification factice | 🔴 | Élevé | P0 (avant toute commercialisation) |
| H-6/H-7 | Promesses marketing/tarifs non tenues | 🟠 | Faible (retirer/nuancer) → Élevé (implémenter) | P0 juridique |
| H-1 | Script tiers `gptengineer.js` + assets Lovable | 🟠 | Faible | P1 |
| H-2 | 5 routes admin en 404 | 🟠 | Faible | P1 |
| H-3 | XLSX non officiel / pas de mapping SYSCOHADA | 🟠 | Élevé | P1 |
| H-4 | Aucun test | 🟠 | Moyen | P1 |
| H-5 | Vulnérabilités dépendances | 🟠 | Faible | P1 |
| M-1 | Données sensibles en clair (localStorage) | 🟡 | Moyen | P2 |
| M-2 | Boutons sociaux `type` manquant | 🟡 | Trivial | P2 |
| M-3 | Double comptage possible du résultat | 🟡 | Moyen | P2 |
| M-4 | Deux lockfiles | 🟡 | Trivial | P2 |
| M-5 | TS permissif | 🟡 | Moyen | P2 |
| M-6 | Formulaires sans envoi | 🟡 | Moyen | P2 |
| L-1..L-3 | 404 reload, tolérances, error boundary, logs | 🔵 | Faible | P3 |

---

## 6. Feuille de route recommandée

**Décision structurante préalable — choisir le positionnement :**

- **Option A — Outil local de préparation** (assumé, honnête, livrable vite). On garde le tout-navigateur, on **corrige le discours** (retirer les promesses de conformité DGI, de chiffrement et les forfaits payants), on soigne l'export « aide à la saisie ». Faible effort, risque juridique levé.
- **Option B — SaaS complet** (ce que vend le marketing). Nécessite backend, auth, base de données, paiement Mobile Money, conformité DGI validée par un expert, tests, CI/CD. Effort important : c'est la feuille de route détaillée de `PRODUCTION_READINESS_AUDIT.md` §Feuille de route, toujours valable.

**Quel que soit le choix — corrections immédiates (P0/P1, faible effort) :**
1. Retirer `gptengineer.js` et les assets `lovable.dev` de `index.html` (H-1).
2. Protéger `/admin` (au minimum un garde de route) et le retirer de l'indexation (`robots.txt`) (C-1).
3. Aligner le discours : nuancer « conforme DGI » et « chiffré », ou retirer les forfaits tant qu'ils ne sont pas réels (H-6, H-7).
4. Réparer ou masquer les 5 liens admin en 404 et ajouter `type="button"` aux boutons sociaux (H-2, M-2).
5. `npm audit fix` + choisir un lockfile unique (H-5, M-4).
6. Ajouter Vitest et une première batterie de tests sur `features/dsf/index.ts` (H-4).

**Consolidation (P2/P3) :**
7. Réactiver `strict` TypeScript par étapes ; ajouter un *error boundary* ; nettoyer les `console.*` (M-5, L-3).
8. Documenter/modéliser le traitement du résultat pour lever le risque de double comptage (M-3).
9. Faire valider les calculs et le format d'export par un expert-comptable OHADA camerounais avant tout usage réel (H-3).

---

## 7. Conclusion

Le socle technique est **sain et bien construit** : build vert, code métier pur et isolé, générateur XLSX maison élégant. Le projet a nettement progressé depuis l'audit de mai (l'application DSF existe désormais réellement). Mais il reste un **prototype** : l'authentification, le backend, le paiement et la conformité DGI promis sont absents, et plusieurs éléments (page admin ouverte, forfaits payants, mentions « conforme DGI »/« chiffré ») créent un **écart de promesse** à corriger en priorité — soit en implémentant, soit en ajustant le discours.

Recommandation : **trancher le positionnement (A ou B)**, puis exécuter d'abord le lot de corrections immédiates à faible effort, qui lèvent l'essentiel du risque de réputation et de sécurité sans chantier lourd.
