# AGRIVO — Ultra-review stratégique : la réorientation est-elle la bonne pour GAGNER ?

> Demandé par Anael le 6 juillet 2026 au soir (J-5 du jury). Question posée : « existe-t-il une
> meilleure réorientation qu'AGRIVO-Valorisation pour gagner le Vibeathon ? » Méthode : chaque
> option est notée contre la **grille officielle du jury** (Impact problème/solution **30 %** ·
> Faisabilité **20 %** · Usage pertinent de l'IA **20 %** · Innovation **15 %** · Qualité du pitch
> **15 %**), en intégrant la contrainte du réel : **5 jours**, un produit déployé (v1.1.0), un deck
> v3, une équipe de 4 briefée, et la frontière stricte avec Nanti (aucun scoring financier).

---

## 1. Verdict (à lire en premier)

**La réorientation « Valorisation + audit-first » est la bonne. Aucun pivot ne la bat sur la grille
à J-5 — mais elle avait un talon d'Achille : l'axe « Usage de l'IA » (20 %) était le plus faible
des cinq. La meilleure « réorientation » n'est donc pas stratégique, elle est narrative et
produit : faire d'AGRIVO non plus « une plateforme de conformité qui a de l'IA », mais
« l'auditeur IA des géodonnées cacao », avec deux nouvelles preuves d'IA UTILE placées exactement
sur les deux moments signatures de la démo.** Décision appliquée immédiatement (v1.2.0, voir §4).

> **MISE À JOUR DU 7 JUILLET : décision appliquée ET en production.** La v1.2.1 est servie sur
> https://agrivo-io.vercel.app ; les deux features IA ont été vérifiées **live en prod** (badge
> « Rédigé par Gemini · IA en direct » capturé) et le reste de la feuille de route (légal, EN,
> polish, durcissement) est exécuté. Le discours « 5 usages IA en production » est désormais
> vérifiable en direct devant le jury.

Nouvelle ligne de pitch : *« Vos données existent déjà. Notre IA les rend prouvables — et
négociables. »* (aucun support à re-tourner : c'est un renforcement, pas un pivot).

---

## 2. Les options de réorientation évaluées

| Option | Impact 30 | Faisab. 20 | IA 20 | Innov. 15 | Pitch 15 | Total /100 | Verdict |
|---|---|---|---|---|---|---|---|
| **A. Statu quo : Valorisation + audit-first (v1.1.0)** | 27 | 19 | 13 | 12 | 13 | **84** | Base solide, IA = maillon faible |
| **B. Retour au micro-crédit producteur** | 18 | 15 | 14 | 10 | 8 | 65 | ÉLIMINÉ — invalidé par le terrain (les coops n'en font pas ; objection fatale d'un juré connaisseur) |
| **C. Pivot côté exportateur (readiness portefeuille, scoring)** | 24 | 10 | 13 | 10 | 9 | 66 | INTERDIT — territoire de Nanti (produit personnel d'Anael, frontière stricte) + 5 jours ne suffisent pas |
| **D. Plateforme d'intégration SNT/CCC (« la couche officielle »)** | 25 | 6 | 8 | 12 | 10 | 61 | Non démontrable : dépend d'un partenariat non signé ; le jury sanctionne l'irréel |
| **E. Carbone / biodiversité / diagnostics agro** | 17 | 8 | 12 | 13 | 9 | 59 | Hors tempo : l'urgence datée (30/12/2026) disparaît du pitch ; roadmap, pas produit |
| **F. RETENU : A + « l'auditeur IA » (2 features IA sur les moments signatures + discours IA renforcé)** | 27 | 18 | **17** | 13 | 14 | **89** | Gagne 5 points là où A plafonne, sans rien casser |

### Pourquoi A reste imbattable sur le fond (et pourquoi on ne pivote pas)
1. **Impact (30 %) : l'histoire est datée et chiffrée.** Échéance RDUE 30/12/2026, CI = 1er
   exportateur mondial, 1,1 M producteurs, et l'argument massue « convergence 2026-27 » (carte
   01/09 + prime cash 01/10 + RDUE 30/12). Aucune autre orientation n'a une horloge aussi violente.
2. **Le pivot Valorisation est VALIDÉ par le marché** (recherche sourcée du 6 juillet) : Meridia
   Verify et KoltiVerify vendent déjà de l'audit de géodonnées (besoin prouvé), prime Fairtrade
   250 €/t au 01/10/2026 dont 40 % cash (la « prime négociée » est réelle), CI risque standard
   (la géolocalisation reste obligatoire). Revenir dessus serait une régression factuelle.
3. **Faisabilité (20 %) : c'est l'atout n°1 à J-5.** v1.1.0 en prod, CI verte, 32 tests, IA Gemini
   live, deck v3, équipe briefée. Tout pivot stratégique détruit cet acquis (deck, vidéo, flashcards,
   répartition des rôles) et fait plonger précisément le critère où AGRIVO domine.
4. **Un jury 2026 sanctionne le pivot de dernière minute** : incohérences entre la démo, le deck et
   les réponses aux questions = perte immédiate de crédibilité (Pitch 15 % + Faisabilité 20 %).

### Le talon d'Achille identifié (et corrigé)
**Usage pertinent de l'IA = 20 % de la note, et c'était l'axe le plus contestable d'AGRIVO** :
- Whisp (la détection) est **pré-enregistré** — assumé, mais ce n'est pas « notre » IA.
- Les trois usages Gemini live (OCR, mémo DDS, copilote) sont réels mais **périphériques au
  moment de démo** : l'OCR passe en 2 secondes, le mémo vit sur une page secondaire, le copilote
  est côté exportateur.
- Surtout : **les deux moments signatures de la démo (l'audit du registre « 63 % prêtes » et
  l'étape Valorisation) ne contenaient AUCUNE IA visible.** Un juré technique pouvait conclure :
  « l'IA n'est pas au cœur, elle décore ».

---

## 3. La réorientation retenue : « l'auditeur IA » (renforcement, pas pivot)

**Positionnement affiné** (une phrase à mettre dans la bouche des 4) :
> « Les coopératives ont déjà les données. AGRIVO est **l'auditeur IA** qui les rend prouvables
> pour Bruxelles — et **négociables** face à l'exportateur. »

**Les deux preuves d'IA ajoutées (v1.2.0), placées exactement sur les moments signatures :**

1. **« Plan d'action IA » sur l'audit du registre** (dashboard coopérative — LE moment « 63 % »).
   Après l'audit, un bouton *« Générer le plan d'action IA »* : Gemini transforme les anomalies
   détectées (comptes exacts par catégorie, actions bureau/terrain — faits déterministes) en un
   plan de travail priorisé, rédigé pour Amadou, en 4-5 étapes concrètes. La boucle devient :
   *import → audit → l'IA dit PAR QUOI COMMENCER*. Phrase jury : « L'IA ne détecte pas seulement
   les problèmes, elle organise la mise en conformité. »
2. **« Argumentaire de prime IA » à l'étape Valorisation** (le moment final du golden path).
   Après « Partager le dossier », un bouton *« Générer l'argumentaire de prime (IA) »* : Gemini
   rédige le brief de négociation de la coopérative (portefeuille prouvé X/Y parcelles, superficie
   vérifiée, arguments primes s'appuyant UNIQUEMENT sur les faits sourcés du dossier — prime
   Fairtrade 250 €/t au 01/10/2026, 40 % cash). L'IA produit l'artefact que le gérant apporte à la
   table de négociation. Phrase jury : « La conformité devient un document qui rapporte de l'argent. »

**Garde-fous charte (identiques aux 3 IA existantes)** : faits et chiffres 100 % déterministes
calculés sur les données, Gemini ne fait que la mise en mots (CHARTE_SYSTEM injecté : statuts
verbatim, « évaluation » jamais « garantie », zéro chiffre inventé, zéro crédit) ; clé serveur
uniquement ; repli démonstration automatique — la démo ne casse jamais.

**Le discours IA passe de 3 à 5 usages en production** : OCR de carte (Vision) · plan d'action
d'audit (nouveau) · mémo de diligence DDS · argumentaire de prime (nouveau) · copilote
portefeuille. Plus Whisp (FAO) comme détection de référence — toujours présenté honnêtement.

### Ce que ça change (et ne change pas) pour l'équipe
- **Deck** : rien d'obligatoire. Option : sur la slide IA, la liste passe à « 5 usages en prod ».
- **Démo** : 2 clics de plus, aux deux endroits où l'attention du jury est déjà maximale.
- **Christ / vidéo plan B** : plan 2bis (import registre) peut inclure le plan d'action IA ; sinon rien.
- **Flashcards** : réponse « votre IA est-elle réelle ? » s'enrichit : « cinq usages en production,
  vérifiables en direct ».

---

## 4. Application immédiate (faite ce soir — v1.2.0)

| # | Changement | Type | Où |
|---|---|---|---|
| 1 | Feature IA « Plan d'action IA » (audit registre) | **Nouvelle IA** | `app/api/gemini/audit-plan` + `registre-import.tsx` |
| 2 | Feature IA « Argumentaire de prime » (Valorisation) | **Nouvelle IA** | `app/api/gemini/valorisation-memo` + `step-valorisation.tsx` |
| 3 | Admin : encart « Mode démonstration » disait « Forcé activé : aucun appel live » alors que l'IA EST live en prod (faux depuis P7) | Fix crédibilité 🟠 | `app/app/admin/page.tsx` |
| 4 | Étape 4 en anglais : phrase de verdict + faisceau de preuves restaient en français (l'API ne renvoyait que le FR) ; lecture vocale forcée fr-FR | Fix i18n 🟠 | `lib/ai/whisp.ts`, `step-analysis.tsx` |
| 5 | Certificat (aperçu) en anglais : statut/phrase restaient FR | Fix i18n 🟡 | `step-certificate.tsx` |
| 6 | « La vérification se déroule en quatre temps » vs stepper à 6 étapes | Fix cohérence 🟡 | `app/app/verifier/page.tsx` |
| 7 | « cockpit » dans le sous-titre Vue exportateur (mot banni par la charte) | Fix charte 🟡 | `app/app/exportateur/page.tsx` |
| 8 | Devise de l'étape Valorisation rendue en italique (charte : Space Grotesk droit, jamais italique) | Fix charte 🔵 | `step-valorisation.tsx` |
| 9 | `favicon.ico` 404 sur toutes les pages (console sale en démo) | Fix polish 🔵 | `app/icon.svg` |

Gates avant push : `tsc --noEmit` ✓ · Vitest (tests existants + nouveaux tests des 2 features) ✓ ·
`next build` ✓ · vérification CDP sur prod après déploiement. Tag `v1.2.0`.
**→ Vérification prod effectuée le 7 juillet (session 22) : les 9 changements sont en ligne (v1.2.1),
les 2 features IA répondent live.**

---

## 5. Ce qu'on ne fait PAS (décisions explicites)

- **Pas de nouveau pivot stratégique** (options B à E rejetées, voir tableau).
- **Pas d'assistant vocal en démo** (Web Speech STT trop fragile en salle ; la lecture TTS existe).
- **Pas de Whisp live** (API FAO sur inscription — position honnête inchangée : « outil de
  référence FAO, intégration au pilote »).
- **Pas de refonte visuelle** (le design system est un acquis ; on raffine, on ne redesigne pas à J-5).
- **Rien qui touche à la frontière Nanti** : toujours aucun score financier, aucun plafond, aucune
  décision de crédit dans AGRIVO.

*AGRIVO — ultra-review stratégique · 6 juillet 2026, mis à jour le 7 juillet (v1.2.1 en prod) ·
préparé pour Anael (chef de projet).
Jumeau PDF : `AGRIVO_Ultra_Review_Strategique.pdf`. Sources du pivot : `PLAN_REORIENTATION_AGRIVO.md`
(§ recherche validée Session 18) ; grille jury : Pitch Masterclass AFRINOVATECH (`ressources/`).*
