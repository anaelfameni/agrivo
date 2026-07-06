# AGRIVO — Prompts à lancer (Fable 5 max, depuis le dossier Agrivo)

> Feuille de route post-ultra-review, mise à jour APRÈS l'application de la v1.2.0 (les corrections
> 🔴 de la revue ont déjà été codées ce soir — voir `AGRIVO_Ultra_Review_Rapport_Final.md` §5).
> Chaque prompt est autonome, à coller tel quel dans une session Claude Code ouverte dans
> `C:\Users\Anael FAMENI\.claude\projects\Agrivo`. Ordre = priorité.

## Tableau de bord

| # | Objectif | Livrable attendu | Priorité | Effet estimé |
|---|---|---|---|---|
| 0 | (ACTION HUMAINE, pas un prompt) Mettre v1.2.0 en prod | v1.2.0 live sur agrivo-io.vercel.app | 🔴 | Débloque les 2 features IA + tous les correctifs devant le jury |
| 1 | Vérification CDP complète de la prod v1.2.0 | Constat écrit + captures des 2 features IA live | 🔴 | Certitude démo |
| 2 | Compléter les pages légales (infos réelles) | 0 « [À compléter] » visible | 🟠 | Crédibilité juré curieux |
| 3 | Dernières traces de FR-glais (certificat EN, SLA) | EN 100 % propre | 🟡 | Finition internationale |
| 4 | Polish visuel hérité (exportateur, tarifs, import replié, eyebrows) | UI resserrée | 🟡 | Perception premium |
| 5 | Durcissement post-jury (identifiants démo, états vides, skeletons) | Prod « vraie » | 🔵 | Après le 11 juillet |

---

## Action 0 — AVANT tout prompt (Anael, 5 min, terminal dans le dossier Agrivo)

```
git push origin main --tags
npx vercel deploy --prod --yes
npx vercel alias set <URL-du-déploiement-affichée-par-la-commande-précédente> agrivo-io.vercel.app
```
Puis ouvrir https://agrivo-io.vercel.app/app/dashboard (compte démo) → « Essayer avec le registre de
démonstration » → « Générer le plan d'action IA » : le badge doit dire **« Rédigé par Gemini · IA en
direct »**. Même vérification à la fin du parcours de vérification (« Générer l'argumentaire de prime »).

---

## Prompt 1 — Vérification CDP complète de la prod v1.2.0 (🔴, ~20 min)

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

## Prompt 2 — Pages légales sans placeholders (🟠, ~30 min, infos à fournir)

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

## Prompt 3 — Dernières traces de FR-glais (🟡, ~30 min)

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

## Prompt 4 — Polish visuel hérité de l'audit P4 (🟡, 1-2 h, optionnel avant jury)

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

## Prompt 5 — Durcissement POST-JURY (🔵, ne pas lancer avant le 12 juillet)

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

*Généré le 6 juillet 2026 (session 21). Jumeau PDF : `AGRIVO_Prompts_A_Run_Fable5.pdf`.*
