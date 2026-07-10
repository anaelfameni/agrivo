# AGRIVO — Document de référence stratégique et opérationnel · v5.0

*Vibeathon 2026 · jury samedi 11 juillet · rédigé par Anael (chef de projet) · confidentiel équipe*
*État du produit : **v1.16.0 EN PRODUCTION** — https://agrivo-io.vercel.app · 79 tests automatisés · IA en direct*

> 🟢 **MISE À JOUR — VEILLE DU JURY (vendredi 10 juillet 2026, v1.16.0).** En cas de contradiction avec le texte plus bas, **ce bloc fait foi**. Document de synthèse à lire en priorité : **`AGRIVO_Equipe_JourJ.pdf`**.
> - **Produit** : v1.16.0 en production — **79 tests** au vert, CI verte.
> - **Prix (à jour)** : coopérative **100 000 FCFA/mois** (≈ **1 200 FCFA** par producteur et par an) · API exportateur **à partir de 1 000 000 FCFA/mois**. *(Anciens 125 000 / 120 000 / 1 500 000 caducs.)*
> - **Deux espaces, deux comptes démo** : Coop `client@test.com` / `123client123` (Amadou) · Exportateur `export@agrivo.com` / `123export123` (Marc).
> - **Le pitch est un pitch PUR de 5 minutes — AUCUNE démo en direct.** PowerPoint **envoyé à l'avance** sur **vibeathonci.com/soumettre**.
> - **Langage** : « évaluation » (jamais « garantie ») · aucun crédit/financement · verdicts **Conforme / Anomalie détectée / Données insuffisantes** · CCC = « démarche engagée ».

> **Comment lire ce document.** C'est la source de vérité du projet, volontairement courte (la v4
> faisait 34 pages ; tout ce qui n'a pas changé n'est pas répété). Chaque membre doit pouvoir
> répondre au jury à partir de ces pages. Les documents compagnons : *Formation équipe* (questions
> jury 1 à 47), *Nouveautés & IA* (les 13 usages détaillés), *Guide app mobile* (pour Christ).

---

## 0. Ce qui change dans cette v5 (par rapport à la v4 du 3 juillet)

| Sujet | v4 | v5 (aujourd'hui) |
|---|---|---|
| Produit | Prototype à construire | **v1.7.1 déployée en production**, 65 tests, CI verte |
| Résumé exécutif | « …l'aide à obtenir un petit crédit » | **Crédit RETIRÉ partout** (pivot Valorisation du 6 juillet) : la conformité se valorise par les **primes** et les **acheteurs premium** |
| Golden path | 5 étapes | **6 étapes** (cartographie GPS ajoutée, mode terrain réel sur mobile) |
| IA | 1 fonctionnalité bonus | **13 usages IA en production** + rituel pré-vol « Démo prête : 6/6 » |
| Équipe | Fatim « contribution stratégique » | **Fatim hors projet.** Rôles réels : voir §7 |
| Positionnement réglementaire | Non traité | **NOUVEAU §3 : personne ne certifie la RDUE** + mention DDS sur le certificat |
| Prix coopérative | 120 000 FCFA/mois | **100 000 FCFA/mois** (≈ 1 200 FCFA/producteur/an pour 1 000 producteurs) |

---

## 1. Résumé exécutif

**AGRIVO en une phrase :** une application (web + mobile) qui vérifie par images satellites qu'une
parcelle respecte la loi européenne anti-déforestation (RDUE), délivre un **certificat d'évaluation
vérifiable par QR code**, et transforme cette conformité en **arguments commerciaux** : primes de
durabilité, accès aux acheteurs premium, dossier prêt pour la déclaration européenne.

**L'exemple simple.** Kouassi cultive son cacao à Soubré depuis 15 ans. Depuis le règlement européen,
les entreprises qui achètent son cacao doivent prouver que sa plantation n'a pas fait disparaître de
forêt depuis fin 2020 — sinon ses fèves ne peuvent plus entrer en Europe. Le gérant de sa coopérative
scanne la carte de Kouassi, cartographie la parcelle au GPS, et le satellite rend l'un des trois
verdicts, toujours les mêmes : **Conforme** · **Anomalie détectée** · **Données insuffisantes**.
Si c'est Conforme, la parcelle rejoint le dossier de la coopérative — et ce dossier devient son
argument pour **négocier ses primes** au-dessus du prix garanti par l'État. Pas de promesse magique :
une preuve, un dossier, un levier commercial.

**Ce qu'AGRIVO ne fait PAS (frontière stricte) :** aucun crédit, prêt, score financier, plafond de
financement ni préfinancement. La valorisation passe par les primes, jamais par la dette.

---

## 2. Le problème et le marché

- **La loi** : règlement (UE) **2023/1115** (RDUE), modifié par le règlement (UE) 2025/2650 —
  applicable le **30 décembre 2026** (grandes et moyennes entreprises) et le **30 juin 2027**
  (micro et petites). Date pivot de déforestation : **31 décembre 2020**.
- **La Côte d'Ivoire est en première ligne** : 1er producteur mondial de cacao (~45 % de l'offre),
  plus de 6 millions de personnes vivent de la filière, **66 % du cacao part vers l'UE**.
- **Classification** : la CI est en **« risque standard »** (benchmarking du 22 mai 2025) → la
  géolocalisation complète des parcelles reste obligatoire (seuls les pays « risque faible » ont une
  diligence simplifiée).
- **Le pays s'équipe** : Système National de Traçabilité (Conseil du Café-Cacao) et **carte du
  producteur obligatoire au 1er septembre 2026** ; ~3 M ha géolocalisés, ~900 000 cartes distribuées
  (chiffres CCC, à citer avec leur source).
- **Le vrai problème qu'AGRIVO résout** : les coopératives détiennent déjà beaucoup de géodonnées
  (fichiers de certification, cartographies financées par les exportateurs), mais une part
  importante n'est **pas fiable ni au format attendu** (~30 % de données terrain non fiables, étude
  Cavally). AGRIVO **audite l'existant, complète les trous sur le terrain, fait juger le satellite,
  et emballe la preuve** dans le format que l'Europe attend.

---

## 3. Positionnement réglementaire — le point clé de cette v5

**Question piège n°1 du jury : « Quel organisme est agréé pour certifier qu'une parcelle respecte
la RDUE ? » Réponse : AUCUN. Cette certification n'existe pas — par conception du règlement.**

- La RDUE n'a prévu **aucun rôle de certification ni d'agrément** (SGS, géant mondial de l'audit,
  l'écrit sur son propre site). Contrairement à l'ancien règlement bois (EUTR), il n'y a plus
  d'organismes de contrôle reconnus par la Commission.
- **C'est l'opérateur** (l'exportateur/importateur qui met le produit sur le marché européen) qui
  dépose sa **déclaration de diligence raisonnée (DDS)** sur TRACES NT et qui **reste seul
  responsable**. Une certification privée (Rainforest Alliance, etc.) peut *aider* l'analyse de
  risque mais **ne vaut jamais conformité** (position de la Commission européenne).
- **Bureau Veritas, SGS et consorts** font de l'**audit et de la vérification en appui** de la
  diligence des gros importateurs — pas de la « certification de conformité RDUE ». Leurs coûts
  sont hors de portée d'une coopérative.
- **AGRIVO est donc exactement à sa place** : nous produisons la **preuve au niveau du champ**
  (géolocalisation, verdict satellite, certificat d'évaluation, dossier consolidé), en amont de la
  DDS de l'exportateur. Nous ne certifions rien — personne ne le peut — nous rendons la déclaration
  de l'exportateur **solide et rapide**.
- **Depuis la v1.7.1, chaque certificat AGRIVO (aperçu, PDF et page publique de vérification) porte
  la mention exacte** : *« Ce certificat atteste l'évaluation réalisée par Agrivo à partir de
  données satellites publiques. Il ne remplace pas la déclaration de diligence raisonnée (DDS) de
  l'exportateur, seul responsable de la conformité au sens du règlement (UE) 2023/1115. »*

**Les mots à employer, toujours :** « évaluation », « preuve », « dossier ». **Jamais** : « garantie »,
« certification de conformité », « agréé RDUE ».

---

## 4. Le produit, état réel (v1.7.1)

**Le parcours de vérification (golden path, 6 étapes — démontré en direct) :**

1. **Connexion & sélection de la coopérative** (démo : Coopérative Agricole de Soubré).
2. **Scan de la carte producteur** — QR d'abord, sinon lecture de la photo par IA (vision) ;
   anti-doublon matricule ; la photo est conservée comme pièce justificative.
3. **Cartographie GPS de la parcelle** — point central (< 4 ha, règle RDUE) ou tour de champ ;
   sur mobile, **vrai GPS en marchant la parcelle** ; 4 contrôles d'intégrité anti-fraude
   (chevauchement, superficie plausible, signal authentique, doublon).
4. **Analyse satellite** — verdict **Whisp (FAO)**, trois statuts figés, explication en langage
   clair, lecture à voix haute, traduction dioula/baoulé, score de résilience des sols.
5. **Certificat PDF** — coordonnées à 6 décimales, sources, QR de vérification publique
   (`/verifier-certificat`), mention DDS (§3).
6. **Valorisation** (si Conforme) — la parcelle rejoint le dossier de la coopérative : primes de
   durabilité, acheteurs premium, partage avec l'exportateur. **Aucun crédit.**

**Autour du parcours :**
- **Import & audit du registre** (le moment « 63 % ») : la coopérative importe ses fichiers
  existants, AGRIVO les audite selon la règle européenne et l'IA rédige le plan d'action.
- **Tableau de bord coopérative** + **espace exportateur** (portefeuille multi-coopératives,
  assistant en langage naturel, mémo de diligence DDS, **dossier acheteur consolidé**).
- **Vérification publique** : n'importe qui (un acheteur, le jury) scanne le QR d'un certificat
  et voit le statut réel — l'« effet final » de la démo.
- **PWA** : la même application du bureau au bord du champ, sans app store.
- **Comptes démo** : coopérative `client@test.com / 123client123` (Amadou · Soubré) · exportateur `export@agrivo.com / 123export123` (Marc · Cacao Export CI) · admin `admin@agrivo.com / 123admin123`.

---

## 5. L'IA d'AGRIVO (axe noté 20 %)

**Le principe cardinal : l'IA ne décide jamais.** Les verdicts viennent du satellite (Whisp, l'outil
de référence de la FAO — précédent : pilote Kenya, 6 000+ parcelles) et de données vérifiables ;
l'IA (Gemini) **lit, explique, rédige et traduit**. Chaque fonction a un repli automatique honnête,
étiqueté — la démo ne casse jamais.

**13 usages en production**, en trois familles :
- **Parcours de vérification** : scan de la carte (vision), verdict satellite, explication du
  verdict, lecture à voix haute, verdict en dioula/baoulé, diagnostic visuel de parcelle par photo
  (observation, jamais un verdict), score de résilience des sols expliqué.
- **Tableau de bord coopérative** : plan d'action après l'audit du registre, revue intelligente du
  registre (signaux faibles), **Copilote RDUE** (répond avec la source citée ; intercepte toute
  question de crédit : « ce n'est pas notre métier »).
- **Espace exportateur** : assistant de portefeuille, mémo de diligence (DDS), dossier acheteur
  consolidé + argumentaire de prime.

**Rituel pré-vol obligatoire avant toute démo** : console admin → « Préchauffer l'IA (démo) » →
attendre le bandeau **« Démo prête : 6/6 en direct »**.

---

## 6. Modèle économique

| Offre | Prix | Contenu |
|---|---|---|
| **Abonnement coopérative** | **100 000 FCFA/mois** | Vérifications illimitées, certificats, audit de registre, hors connexion, support. ≈ **1 200 FCFA par producteur et par an** (coopérative de 1 000 producteurs) — hypothèse à valider au pilote (benchmark marché 2–5 $) |
| **API exportateur** | **à partir de 1 000 000 FCFA/mois** | Portefeuille multi-coopératives, exports TRACES NT, engagement de disponibilité |

- **Gratuit pour le producteur** : la vérification est prise en charge par l'abonnement de sa coopérative.
- **Aucune commission de crédit** (retirée avec le pivot Valorisation — le modèle est volontairement simple).
- Honnêteté sur les coûts : Whisp/Copernicus gratuits en base, mais l'imagerie haute résolution et
  les quotas commerciaux d'IA sont des coûts de licence à absorber à l'échelle.

---

## 7. L'équipe (rôles réels, à connaître pour le cold-call)

| Membre | Rôle | Au jury |
|---|---|---|
| **Anael** | Chef de projet · produit & marque | Pitch principal + démo web |
| **Christ** | **Application mobile** | Démo mobile (GPS terrain) + questions app |
| **Gaddiel** | **Backend & API** | Questions techniques (API, données, sécurité) |
| **Domy** | Conformité & réglementaire | Questions RDUE/ARTCI + validation des chiffres |

*Fatim n'est plus dans le projet (retirée du site en v1.7.1).* N'importe quel membre peut être
interrogé sans préavis : chacun lit *Formation équipe* (47 questions/réponses prêtes).

---

## 8. La démo du jury (samedi 11 juillet)

- **Grille officielle** : Impact 30 % · Faisabilité 20 % · Usage de l'IA 20 % · Innovation 15 % ·
  Qualité du pitch 15 %. Pitch 5 minutes + questions.
- **Rituel pré-vol** (§5) puis déroulé : problème → import registre « 63 % » → golden path complet
  → certificat + QR scanné par le jury → dossier acheteur → les trois phrases clés.
- **Les trois phrases clés** : « L'IA ne décide jamais, elle explique. » · « La démo ne casse
  jamais. » · « Une seule application, du bureau au bord du champ. »
- **Plan B** : replis IA honnêtes automatiques + vidéo de secours.
- **Interdits de langage (rappel absolu)** : « garantie » → dire « évaluation » ; aucun pourcentage
  de précision inventé ; aucun logo partenaire fabriqué (dire « contact identifié ») ; statuts
  VERBATIM ; jamais « négocier le prix » (fixé par l'État) → « négocier les primes » ; aucun crédit.

---

## 9. Ce qui reste à faire avant samedi

| # | Action | Qui |
|---|---|---|
| 1 | Activer la **facturation Gemini Tier 1** (fiabilise l'IA en direct) | Anael |
| 2 | Envoyer les **écrans de l'app mobile** pour revue (charte, statuts, mention DDS) | Christ |
| 3 | Valider **ou retirer** le « 52 % » (Trase) du deck | Domy |
| 4 | Relecture **dioula/baoulé** par un locuteur natif (préférer le dioula en démo) | Équipe |
| 5 | Tester **GPS réel + diagnostic photo** sur le téléphone de démo | Anael + Christ |
| 6 | **Répétition générale chronométrée** (vendredi) avec rituel pré-vol | Tous |
| 7 | Après le jury : **rotation de la clé Gemini** | Anael |

---

*Sources principales : règlement (UE) 2023/1115 et (UE) 2025/2650 (EUR-Lex) · Commission européenne
(Green Forum, FAQ diligence raisonnée) · benchmarking pays du 22 mai 2025 · SGS & Bureau Veritas
(pages services RDUE) · Conseil du Café-Cacao / AIP (SNT, carte producteur) · FAO (Whisp) ·
Fairtrade (primes cacao 2026).*
