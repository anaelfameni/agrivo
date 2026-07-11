# AGRIVO — Prompts à lancer (Fable 5 max, depuis le dossier Agrivo)

> Feuille de route post-ultra-review. **Mise à jour du 7 juillet 2026 : les prompts 1 à 5 ont TOUS
> été exécutés (session 22) et la v1.2.1 est EN PRODUCTION sur https://agrivo-io.vercel.app.**
> Les prompts sont conservés ci-dessous pour référence, chacun avec son résultat. La section
> « Et maintenant » en fin de document liste ce qui reste (1 commande + préparation jury).

## Tableau de bord (état au 7 juillet)

| # | Objectif | Priorité | État | Résultat |
|---|---|---|---|---|
| 0 | Mettre v1.2.x en prod (action humaine) | 🔴 | ✅ **FAIT** (déploiement + alias passés) | v1.2.1 live ; reste `git push origin main --tags` |
| 1 | Vérification CDP complète de la prod | 🔴 | ✅ FAIT | 2 features IA **live confirmées** en prod ; 1 vrai bug admin trouvé et corrigé (`/api/admin/etat`) |
| 2 | Pages légales sans placeholders | 🟠 | ✅ FAIT | 0 « [À compléter] » ; formulations honnêtes d'avant-immatriculation (infos RCCM non fournies) |
| 3 | Dernières traces de FR-glais | 🟡 | ✅ FAIT | Aperçu certificat 100 % EN (le PDF reste FR, officiel) ; « SLA commitment » |
| 4 | Polish visuel hérité (U-11/15/16/17) | 🟡 | ✅ FAIT | Import replié par défaut, carte exportateur, bouton Export, eyebrows ; U-16 déjà résolu par le pivot |
| 5 | Durcissement (identifiants, skeletons, états vides, PLAN v2) | 🔵 | ✅ FAIT (avancé) | /connexion sans identifiants, skeletons, états vides contextuels, transitions onglets, `PLAN_V2.md` |

---

## Action 0 — ✅ FAIT sauf le push (Anael, 1 min, terminal dans le dossier Agrivo)

Le déploiement et l'alias sont passés (v1.2.1 servie sur https://agrivo-io.vercel.app, badges
« Rédigé par Gemini · IA en direct » vérifiés). Il reste UNE commande pour aligner GitHub/CI :

```
git push origin main --tags
```

---

## Prompt 1 — Vérification CDP complète de la prod v1.2.0 (🔴) — ✅ EXÉCUTÉ le 7 juillet

> **Résultat** : 4 points sur 5 OK du premier coup (plan d'action IA live avec comptes exacts —
> le registre démo contient 1 doublon, pas 2 ; argumentaire live 4 §, zéro vocabulaire crédit ;
> étape 4 EN complète ; « cinq temps »/favicon OK). Le point admin était un VRAI KO : le client
> lisait une constante serveur (toujours « mock ») → corrigé par la route `/api/admin/etat`
> (`export const dynamic = "force-dynamic"`) ; la prod répond `{"mock":false}`.

```
Lis CLAUDE.md (session 21) puis vérifie EN PRODUCTION (https://agrivo-io.vercel.app) que la v1.2.0
est bien celle servie et que tout l'ultra-review est résorbé, captures CDP à l'appui (desktop 1440
et mobile 390, FR et EN) :
1) Dashboard coop → registre de démonstration → « Générer le plan d'action IA » : badge « Rédigé
   par Gemini · IA en direct », étapes bureau avant terrain, chiffres exacts (2 doublons, etc.).
2) Parcours complet 6 étapes → étape Valorisation → partage → « Générer l'argumentaire de prime
   (IA) » : badge live, 4 paragraphes, bouton Copier ; AUCUN vocabulaire de crédit.
3) Étape 4 en ANGLAIS : phrase de verdict, faisceau de preuves et bouton Listen en anglais.
4) /app/admin : l'encart « Mode démonstration » dit bien que la clé est posée et liste les 5 usages
   live ; MOCK_MODE = false ; toggle à gauche.
5) Étape 1 : « cinq temps » ; sous-titre Vue exportateur sans « cockpit » ; devise Valorisation non
   italique ; console sans 404 favicon.
Ne modifie AUCUN code sauf si un point échoue (alors corrige, gates tsc + vitest + build, et
redemande-moi le déploiement). Termine par un tableau point → OK/KO → preuve, et mets à jour le
journal de CLAUDE.md.
```

## Prompt 2 — Pages légales sans placeholders (🟠) — ✅ EXÉCUTÉ le 7 juillet (repli honnête)

> **Résultat** : les infos réelles (RCCM, adresse…) n'ayant pas été fournies, la variante honnête
> a été appliquée : « projet porté par l'équipe AGRIVO, société en cours de constitution »,
> directeur de la publication **Anael Fameni**, DPO « désigné à l'immatriculation », juridictions
> ivoiriennes. 0 « À compléter » dans app/ et components/ (grep + CDP). ⚠️ À la création de la
> société : repasser mettre les mentions définitives (RCCM, siège, capital).

```
Lis CLAUDE.md. Les pages /mentions-legales, /confidentialite et /cgu affichent des placeholders
« [À compléter : …] » (raison sociale, capital, RCCM, adresse, directeur de la publication, e-mail,
DPO) — signal « inachevé » devant le jury. Voici les informations réelles : [ANAEL : COLLE ICI
raison sociale/forme, capital, RCCM ou « immatriculation en cours », adresse, directeur de la
publication, e-mail de contact, nom/e-mail du DPO — sinon écris « projet en cours d'immatriculation,
porté par l'équipe AGRIVO » là où c'est honnête].
1) Remplace chaque <Todo> par le texte réel fourni ; si une info manque, reformule honnêtement sans
   crochets ni « À compléter » (ex. « Immatriculation en cours — coordonnées définitives publiées à
   l'issue »). Aucun placeholder visible ne doit rester.
2) Grep final : « À compléter » = 0 occurrence dans app/ et components/.
3) Gates : tsc --noEmit + npx vitest run + next build verts ; capture CDP des 3 pages FR desktop.
4) Mets à jour le journal de CLAUDE.md et signale-le.
```

## Prompt 3 — Dernières traces de FR-glais (🟡) — ✅ EXÉCUTÉ le 7 juillet

> **Résultat** : `buildCertificat(p, verdict, lang)` — aperçu EN complet (date en-GB, filières
> Cocoa/Coffee/…, coordonnées N/S/E/W) ; le TÉLÉCHARGEMENT PDF reste la version FR (document
> officiel) via la prop `pdfData`. « Guaranteed SLA » → « SLA commitment » (landing + tarifs EN).
> Vérifié en CDP : parcours EN jusqu'à l'étape 5 sans un mot de français.

```
Lis CLAUDE.md. Résorbe les dernières traces de français sous interface anglaise, SANS toucher au
PDF de certificat (document officiel volontairement FR) :
1) lib/certificat-data.ts : buildCertificat accepte un paramètre lang ('fr' par défaut) ; en 'en',
   emisLe utilise toLocaleString('en-GB') et filiereLabel une table EN (Cocoa, Coffee, Rubber, Oil
   palm, Cattle, Soy, Wood) ; step-certificate lui passe la langue courante POUR L'APERÇU seulement
   (le téléchargement PDF continue d'utiliser la version FR).
2) app/page.tsx:255 et app/tarifs (EN) : « guaranteed SLA » → « SLA commitment » (purisme charte).
3) Vérifie en CDP (parcours EN desktop jusqu'à l'étape 5) : plus AUCUN mot français à l'écran.
4) Gates tsc + vitest + build ; journal CLAUDE.md à jour.
```

## Prompt 4 — Polish visuel hérité de l'audit P4 (🟡) — ✅ EXÉCUTÉ le 7 juillet

> **Résultat** : U-11 import replié par défaut (une ligne « Auditer mon registre », +1 clic dans le
> guide démo) ; U-15 pastilles carte plus lisibles + cadrage resserré + scrollbar discrète + bouton
> « Exporter GeoJSON » aligné secondaire ; U-16 constaté DÉJÀ résolu par le pivot (rien à changer) ;
> U-17 eyebrows codifiés (page publique = ambre, section = vert).

```
Lis CLAUDE.md et AGRIVO_Ultra_Review_Rapport_Final.md (constats U-11, U-15, U-16, U-17). Dans
l'esprit STRICT du design system existant (aucune nouvelle couleur/police, framer-motion sobre,
reduced-motion respecté) :
1) U-11 : l'import du registre du dashboard démarre en état REPLIÉ compact (une ligne : icône +
   titre + CTA) et s'étend au clic ou après un import ; l'état étendu actuel reste identique.
2) U-15 : vue exportateur — léger zoom-to-fit initial de la carte sur les clusters ; scrollbar du
   tableau stylée discrète ; bouton « Exporter GeoJSON » aligné sur la hiérarchie des CTA.
3) U-16 : /tarifs — la carte « Dossier exportateur / Inclus » prend la même hauteur que les plans
   payants (clarifier que ce n'est pas un plan).
4) U-17 : uniformise les eyebrows des pages publiques (même casse, même logique de couleur).
Vérification CDP avant/après par zone (1440 + 390, FR + EN), gates tsc + vitest + build,
journal CLAUDE.md à jour.
```

## Prompt 5 — Durcissement (🔵) — ✅ EXÉCUTÉ le 7 juillet (avancé sur ordre d'Anael)

> **Résultat** : identifiants démo retirés de /connexion (0 occurrence dans le HTML servi, bouton
> 1-clic conservé) ; skeletons /app (silhouette du dashboard) ; états vides contextuels
> (recherche vs filtres) avec bouton de réinitialisation sur Producteurs et Parcelles ;
> transitions d'onglets exportateur 180 ms (reduced-motion respecté) ; **`PLAN_V2.md`** rédigé
> (auth serveur, Postgres/PostGIS, Whisp live, registre de certificats).

```
Lis CLAUDE.md. Le jury est passé : on durcit pour de vrais utilisateurs.
1) /connexion : masque les identifiants du compte démo derrière un bouton « Utiliser le compte de
   démonstration » sans les afficher en clair (U-07).
2) États vides spécifiques par contexte (recherches sans résultat, filtres) et skeletons de
   chargement pour /app (listes, cartes) — sobres, reduced-motion.
3) Transitions d'onglets exportateur (fondu + léger slide, 180 ms).
4) Revue de LIVRABLE_AGRIVO_V4.md « chemin vers la prod » : liste ce qui doit devenir serveur
   (auth réelle, stockage) et propose le plan v2.0.0.
Gates habituels, journal CLAUDE.md.
```

---

### Gates communs à tous les prompts (rappel)
`npx tsc --noEmit` ✓ · `npx vitest run` (39+ tests) ✓ · `npx next build` ✓ · vérification CDP
desktop 1440 + mobile 390, FR + EN sur les zones touchées · respect charte (statuts verbatim,
« évaluation » jamais « garantie », zéro % inventé, zéro crédit, pas d'italique display, pas de
tiret cadratin) · mise à jour du journal `CLAUDE.md` signalée par « ✅ CLAUDE.md mis à jour ».

---

## Et maintenant (état au 7 juillet — ce qui reste avant samedi)

**Actions humaines (Anael)** :
1. `git push origin main --tags` (1 min) — GitHub/CI alignés sur la prod.
2. **Facturation Tier 1 sur la clé Gemini** (5 min, AI Studio → Billing) — supprime les 429
   intermittents du free tier depuis les IP partagées Vercel. À faire avant vendredi.
3. Vercel → Settings → Domains → attacher `agrivo-io.vercel.app` au projet (2 min).
4. Après le jury : **faire tourner la clé Gemini** (elle a transité en clair dans une conversation).

**Prompt 6 (optionnel, ~10 min) — enrichir le guide présentateur intégré** :
```
Lis CLAUDE.md (session 22). Dans components/demo-guide.tsx (overlay Ctrl+Shift+D), le déroulé ne
mentionne pas encore les 2 clics IA de v1.2.0 : ajoute au segment dashboard « puis Générer le plan
d'action IA (badge Rédigé par Gemini) » et au segment parcours « étape Valorisation : Générer
l'argumentaire de prime (IA) ». Aucun autre changement. Gates tsc + vitest + build, redéploiement
demandé à Anael, journal CLAUDE.md.
```

**Prompt 7 (APRÈS le jury) — lancer la v2** :
```
Lis CLAUDE.md et PLAN_V2.md. Démarre le chantier 1 (socle données + auth serveur) : propose le
schéma Postgres/PostGIS complet (coopératives, producteurs, parcelles, vérifications, certificats,
dossiers partagés), le choix Supabase vs Neon argumenté, et la migration de l'auth localStorage
vers des sessions httpOnly — en plan d'abord, sans coder, pour validation.
```

*Généré le 6 juillet 2026 (session 21), mis à jour le 7 juillet (session 23 — prompts 1-5 exécutés).
Jumeau PDF : `AGRIVO_Prompts_A_Run_Fable5.pdf`.*
