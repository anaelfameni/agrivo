# AGRIVO — Formation de l'équipe : tout comprendre, tout savoir expliquer

> **Document de formation officiel** — 7 juillet 2026, rédigé par Anael (chef de projet) pour
> Christ, Gaddiel et Domy. Objectif double : (1) que chacun **maîtrise le projet AGRIVO de A à Z**,
> même sans avoir suivi sa construction ; (2) que chacun puisse **répondre à n'importe quelle
> question du jury** samedi 11 juillet au CSCTICAO — le jury peut interroger n'importe lequel
> d'entre nous, pas seulement celui qui pitche.
> Ce document se suffit à lui-même : aucune connaissance préalable n'est nécessaire.
> **Temps de lecture : ~45 minutes. À lire AVANT la répétition générale de vendredi 10.**
> Version du produit à jour : **v1.16.0 en production**.

> 🟢 **MISE À JOUR — VEILLE DU JURY (vendredi 10 juillet 2026, v1.16.0).** En cas de contradiction avec le texte plus bas, **ce bloc fait foi**. Document de synthèse à lire en priorité : **`AGRIVO_Equipe_JourJ.pdf`**.
> - **Produit** : v1.16.0 en production sur https://agrivo-io.vercel.app — **79 tests** automatisés au vert, CI verte.
> - **Prix (à jour)** : coopérative **100 000 FCFA/mois** (≈ **1 200 FCFA** par producteur vérifié et par an) · API exportateur **à partir de 1 000 000 FCFA/mois**. *(Les anciens 125 000 / 120 000 / 1 500 000 cités plus bas sont caducs.)*
> - **Deux espaces, deux comptes démo** : Coopérative `client@test.com` / `123client123` (Amadou) · Exportateur `export@agrivo.com` / `123export123` (Marc).
> - **Le pitch est un pitch PUR de 5 minutes — AUCUNE démonstration en direct.** Le PowerPoint est **envoyé à l'avance** sur **vibeathonci.com/soumettre**. Les passages « vérifier en direct » / « démo » plus bas ne s'appliquent PAS au pitch (ils restent vrais pour tester le site à titre personnel).
> - **Capture GPS** : sur le **site web, la coopérative saisit ses coordonnées** (le mode « Tour de champ GPS réel » du web a été RETIRÉ en v1.8) ; la capture GPS temps réel vit dans l'**app mobile**. Ignorer le §4.6 « mode terrain PWA ».
> - **Scan mobile réparé** : bouton **« Activer la caméra »** puis **« Scanner la carte »** ; sinon **« Saisir manuellement »**. Message si l'image est floue.
> - **Langage** : « évaluation » (jamais « garantie ») · **aucun crédit ni financement** · verdicts exacts **Conforme / Anomalie détectée / Données insuffisantes** · Conseil du Café-Cacao = « **démarche engagée** », jamais « partenariat ».

---

## 1. Comment utiliser ce document

- **Tout le monde** lit tout, dans l'ordre. Les parties 2, 3, 4 donnent la compréhension ;
  les parties 9, 10 et 12 donnent les réflexes pour le jury.
- **Avant vendredi**, chacun doit réussir le quiz final (partie 14) sans regarder les réponses.
- **Le jour J**, relire uniquement la partie 15 (« La fiche ») : elle tient sur une page.
- Approfondissements par rôle : Gaddiel → parties 4 et 5 (technique + IA) en priorité ·
  Christ → partie 11 (démo) + son guide dédié `AGRIVO_Guide_App_Mobile.pdf` ·
  Domy → parties 6, 7 et 10 (chiffres, marché, concurrence).
- Règle d'or en cas de doute face au jury : **dire la vérité simplement**. AGRIVO assume ce qui
  est simulé et prouve ce qui est réel — c'est notre force, pas une faiblesse.

---

## 2. AGRIVO en 30 secondes (à savoir réciter)

> « Au 30 décembre 2026, l'Europe n'achètera plus un grain de cacao sans **preuve GPS qu'il ne
> vient pas d'une zone déforestée**. La Côte d'Ivoire, premier producteur mondial, est en première
> ligne. Les coopératives ont déjà des fichiers de parcelles — mais environ **30 % de ces données
> ne sont pas assez fiables** pour la réglementation. **AGRIVO est l'auditeur IA de ces données** :
> il importe le registre de la coopérative, détecte ce qui ne va pas, guide la correction sur le
> terrain, fait vérifier chaque parcelle par satellite, délivre un certificat vérifiable par
> n'importe quel acheteur — et transforme cette conformité en **argument de négociation** pour
> obtenir des primes au-dessus du prix garanti. De la parcelle vérifiée à la prime négociée. »

Les trois phrases signature (une par situation) :
- La promesse : **« De la parcelle vérifiée à la prime négociée. »**
- Le positionnement : **« Vos données existent déjà. Notre IA les rend prouvables — et négociables. »**
- L'IA : **« L'IA ne détecte pas seulement les problèmes : elle organise la mise en conformité et
  rédige l'argument commercial. »**

---

## 3. Le problème, expliqué ultra simplement

### 3.1 La RDUE, c'est quoi ?

La **RDUE** (Règlement de l'Union Européenne contre la déforestation, aussi appelée EUDR en
anglais) est une loi européenne. Elle dit une chose simple : **pour vendre en Europe certains
produits agricoles, il faut PROUVER qu'ils ne viennent pas d'une terre déforestée après le
31 décembre 2020.**

- La preuve exigée est **géographique** : chaque parcelle de production doit être localisée par
  GPS. Petite parcelle (moins de 4 hectares) : un point GPS suffit. Grande parcelle (4 hectares ou
  plus) : il faut le **contour complet** du champ (un polygone).
- L'entreprise qui importe en Europe (l'« opérateur ») dépose une **déclaration de diligence
  raisonnée (DDS)** sur le portail européen **TRACES NT**, avec ces coordonnées à l'appui.
- 7 denrées sont concernées : **cacao, café, hévéa (caoutchouc), palmier à huile, bovins, soja,
  bois** — et leurs dérivés (chocolat, pneus, meubles…).
- Dates d'application : **30 décembre 2026** pour les grandes et moyennes entreprises,
  30 juin 2027 pour les petites. Autrement dit : **la campagne cacao 2026-27 est LA campagne du
  basculement.**

Image simple à retenir : avant, l'acheteur européen demandait « c'est du bon cacao ? ».
Maintenant il demande **« montre-moi SUR LA CARTE d'où il vient, parcelle par parcelle »**.

### 3.2 Pourquoi la Côte d'Ivoire est en première ligne

- La CI est le **premier producteur mondial de cacao**, et l'Union européenne est son premier
  débouché. Pas de conformité = plus d'accès au premier client du pays.
- Le pays compte environ **1,1 million de producteurs recensés** par le Conseil du Café-Cacao
  (CCC), ~900 000 cartes de producteur émises, et ~3 millions d'hectares déjà géolocalisés par
  l'État.
- Le 22 mai 2025, la Commission européenne a classé la CI en **« risque standard »** : la
  géolocalisation complète reste donc obligatoire (la version simplifiée de la loi ne bénéficie
  qu'aux pays « risque faible »).
- **La convergence 2026-27, notre argument massue** : carte producteur obligatoire au
  1er septembre 2026 + nouvelle prime Fairtrade avec cash direct au 1er octobre 2026 + RDUE au
  30 décembre 2026. **Trois échéances sur la même campagne.** La coopérative qui peut PROUVER sa
  conformité à ce moment-là gagne sur tous les tableaux.

### 3.3 Le VRAI problème qu'AGRIVO résout (bien le comprendre)

Le réflexe serait de croire que le problème est de COLLECTER des données GPS. **Faux** : les
coopératives en ont déjà, souvent beaucoup.

- Les coopératives certifiées **Rainforest Alliance** ont l'obligation de cartographier leurs
  parcelles (fichiers .geojson/.kml qui leur appartiennent).
- Les **exportateurs financent** des campagnes de cartographie chez leurs coopératives partenaires.
- L'État (CCC) a géolocalisé ~3 millions d'hectares.

Le problème est que **ces données ne sont pas fiables** : l'étude Meridia/Rabo Foundation (région
du Cavally) a montré qu'environ **30 % des données terrain ne sont pas assez fiables pour la
RDUE** — polygones jamais fermés, doublons, parcelles de 4 ha et plus enregistrées comme un simple
point, contours qui se chevauchent, coordonnées hors zone.

**AGRIVO n'est donc pas un outil de collecte : c'est un outil d'AUDIT.** L'analogie à servir au
jury : *les coopératives ont déjà la voiture ; AGRIVO est le contrôle technique qui la rend
autorisée à rouler — et qui vous aide à réparer ce qui ne passe pas.*

---

## 4. La solution AGRIVO, pas à pas

### 4.1 Les trois idées qui structurent tout le produit

1. **L'audit avant la collecte.** On importe le registre existant de la coopérative, on l'audite
   selon la règle RDUE, et on ne fait capturer sur le terrain QUE ce qui manque.
2. **Le satellite juge, il ne déclare pas.** Whisp (l'outil de la FAO) vérifie ce qu'il y a DANS
   le polygone déclaré ; la géométrie légale vient toujours de la déclaration de l'opérateur.
3. **La conformité se valorise par les primes, jamais par la dette.** Aucun crédit, aucun score
   financier dans AGRIVO. La parcelle conforme alimente le dossier que la coopérative utilise pour
   négocier des primes AU-DESSUS du prix garanti par l'État.

### 4.2 Le produit en une carte mentale

- **Site public** (vitrine) : landing, méthodologie, tarifs, FAQ, à-propos, aide, pages légales,
  et surtout **/verifier-certificat** — la page où N'IMPORTE QUI peut vérifier un certificat AGRIVO
  en scannant son QR code. FR et EN.
- **Espace coopérative** (après connexion) : le tableau de bord d'Amadou (notre persona gérant,
  Coopérative Agricole de Soubré) : 4 indicateurs, **import & audit du registre**, dernières
  vérifications, alertes ; les pages Producteurs, Parcelles, Paramètres, Consentement ;
  le **parcours « Nouvelle vérification » en 6 étapes** (cœur du produit).
- **Vue exportateur** (démonstration du point de vue de l'acheteur) : les 4 indicateurs officiels
  (45 producteurs audités · 62 % de conformité · 157 ha cartographiés · 81 t validées), la carte
  satellite du portefeuille, l'**export GeoJSON prêt pour TRACES NT**, le copilote IA.
- **App mobile** (Christ) : le même parcours en 6 étapes, mais avec **GPS et caméra réels** sur le
  terrain — c'est elle qui fait la démo du golden path.

### 4.3 Le parcours de vérification (golden path, 6 étapes) — LE cœur à connaître

| # | Étape | Ce qui se passe | Ce que ça produit |
|---|---|---|---|
| 1 | Sélection & consentement | Contexte coopérative + rappel du consentement éclairé du producteur (ARTCI) | Un cadre légal propre |
| 2 | **Scan de la carte producteur** | QR code d'abord (lecture locale instantanée) ; sinon photo → OCR **Gemini Vision** pré-remplit le formulaire ; anti-doublon sur le matricule ; la photo est conservée comme preuve | L'identité vérifiée du producteur |
| 3 | **Cartographie GPS** | Sur mobile : **« Tour de champ GPS (réel) »** = la vraie géolocalisation de l'appareil pose les waypoints en marchant (v1.7.0). Sinon/desktop : point central (< 4 ha) · tour de champ simulé · « J'ai déjà les coordonnées » ; puis 4 contrôles d'intégrité anti-fraude | La géométrie légale de la parcelle (WGS-84, 6 décimales) |
| 4 | **Analyse satellite** | Whisp (FAO) compare la parcelle aux images satellite depuis le 31/12/2020 → un des **3 statuts figés** + faisceau de preuves + lecture vocale | Le verdict déforestation |
| 5 | **Certificat** | PDF officiel n° AGV-2026-XXXX avec toutes les coordonnées, les sources, l'avertissement légal et un **QR code de vérification publique** | La preuve tangible et vérifiable |
| 6 | **Valorisation** | La parcelle conforme rejoint le dossier de conformité ; 3 débouchés (primes, acheteurs premium, dossier TRACES NT) ; **« Générer l'argumentaire de prime (IA) »** ; partage avec l'exportateur | L'argument commercial |

Les **3 statuts possibles, mot pour mot** (à réciter sans jamais les reformuler) :
- 🟢 **Conforme** — « Aucune déforestation détectée après le 31 décembre 2020. »
- 🔴 **Anomalie détectée** — « Une perte de couverture forestière a été identifiée sur cette zone. »
- ⚪ **Données insuffisantes** — « Présence de nuages ou données satellites insuffisantes pour statuer. »

Les branchements : *Données insuffisantes* → pas de certificat (nouveau passage satellite
nécessaire) · *Anomalie détectée* → certificat documentaire, pas de valorisation · *Conforme* →
certificat + valorisation.

### 4.4 Le moment « 63 % » (l'import du registre) — LE moment signature de la démo web

Sur le tableau de bord, la ligne « Auditer mon registre » se déplie. On clique sur « Essayer avec
le registre de démonstration » : un fichier de 30 parcelles **volontairement défectueux** est
audité en direct, dans le navigateur (les données ne partent jamais — argument ARTCI).

Résultat affiché : **« 63 % prêtes pour la RDUE » — 19 parcelles sur 30, 11 à corriger**, avec
chaque anomalie typée et son action : « à corriger au bureau » (ex. le doublon de matricule) ou
« à compléter sur le terrain » (ex. les 3 parcelles ≥ 4 ha enregistrées comme simple point, qui
exigent un tour de champ).

Puis le deuxième clic signature : **« Générer le plan d'action IA »** — Gemini transforme ces
anomalies en plan de travail rédigé pour le gérant : d'abord les corrections de bureau, ensuite
les missions terrain, puis la réimportation et la vérification satellite. Badge affiché :
« Rédigé par Gemini · IA en direct ».

### 4.5 L'effet final : la vérification publique

Le certificat PDF contient un QR code. **Le jury le scanne avec SON propre téléphone** →
la page /verifier-certificat confirme le statut de la parcelle. Phrase à dire à ce moment :
« N'importe quel acheteur, n'importe où dans le monde, peut vérifier nos certificats. »

### 4.6 Une seule application, du bureau au champ (mode terrain, v1.7.0)

**AGRIVO est une PWA** (Progressive Web App) : une **seule application** qui s'adapte au PC, à la
tablette et au mobile, et qui **s'installe directement depuis le navigateur** (« Ajouter à l'écran
d'accueil ») — **pas besoin de Google Play, pas d'APK de 50 Mo, pas de mise à jour à télécharger**.
En Côte d'Ivoire (Android d'entrée de gamme, data limitée), c'est un vrai avantage.

Depuis la **v1.7.0**, cette même application couvre les deux bouts de la chaîne :
- **Au bureau**, le gérant importe son registre, lance l'audit, consulte le tableau de bord et la
  vue exportateur.
- **Au bord du champ**, sur un téléphone, à l'étape Cartographie apparaît le mode
  **« Tour de champ GPS (réel) »** : il écoute la **vraie géolocalisation** de l'appareil — on
  marche le périmètre, les waypoints se posent tout seuls (un tous les ~8 m), avec distance et
  précision en direct, puis fermeture du polygone. Avant la v1.7.0, le web *simulait* cette marche ;
  maintenant c'est du **vrai GPS**.

Phrase à dire au jury : **« Une seule application, du bureau du gérant au bord du champ, sans passer
par un store — sur les téléphones qu'ont déjà les agents de la coopérative. »** À quoi ça sert
concrètement : la même app qui, au bureau, dit « il te manque le contour de 3 parcelles » te laisse,
au champ, marcher ces 3 parcelles pour les capturer. On ne cartographie QUE les trous laissés par
l'audit, jamais tout le registre.

---

## 5. L'IA d'AGRIVO (l'axe noté 20 % — à maîtriser parfaitement)

### 5.1 Le principe cardinal (à comprendre avant tout)

**Les chiffres et les verdicts sont TOUJOURS calculés par du code déterministe sur les données.
L'IA générative met en mots, elle n'invente jamais un fait.** Chaque appel à Gemini part avec
notre charte système : statuts verbatim, « évaluation » jamais « garantie », zéro chiffre inventé,
zéro vocabulaire de crédit. Si la réécriture de Gemini ne respecte pas la trame (nombre d'étapes,
comptes exacts), elle est rejetée et la version déterministe s'affiche.

### 5.2 Deux IA, jamais confondues

- **Whisp (FAO Open Foris)** = la **détection satellite**. Ce n'est PAS notre modèle : c'est
  l'outil de référence de l'ONU/FAO (pilote Kenya, 6 000+ parcelles), qui croise les sources
  Copernicus Sentinel-2 et JRC Global Forest Cover. Dans la démo, les verdicts sont
  **pré-enregistrés** — assumé devant le jury : « API sur inscription, intégration prévue au
  pilote ». Whisp fournit le verdict par **convergence de preuves**, jamais un pourcentage.
- **Gemini (Google, modèle gemini-2.5-flash)** = le **langage et la vision**. Cinq usages
  appellent réellement Gemini **en production** :

| # | Usage | Où dans le produit | Ce que fait Gemini |
|---|---|---|---|
| 1 | **OCR de la carte producteur** | Étape 2 du parcours | Vision : extrait nom, matricule, localité de la photo |
| 2 | **Plan d'action IA** (v1.2.0) | Dashboard, après l'audit du registre | Rédige le plan de mise en conformité (faits calculés, bureau puis terrain) |
| 3 | **Mémo de diligence (DDS)** | Page parcelle | Rédige le dossier de diligence de la parcelle |
| 4 | **Argumentaire de prime IA** (v1.2.0) | Étape 6 Valorisation | Rédige le brief de négociation (jamais un montant promis) |
| 5 | **Copilote portefeuille** | Vue exportateur | Répond aux questions sur le portefeuille (chiffres calculés, mise en mots) |

Phrase jury : **« Cinq usages appellent réellement Gemini en production, vérifiables en direct —
et l'IA ne fait que mettre en mots des faits calculés. »**

### 5.3 Le repli honnête (notre filet de sécurité — le présenter comme une force)

Sans clé API, ou si Google refuse l'appel (quota), chaque fonction retombe automatiquement sur sa
version déterministe pré-rédigée, **étiquetée « Mode démonstration » à l'écran**. Rien ne casse,
rien ne ment. L'écran admin (compte admin) affiche l'état RÉEL du mode IA. C'est une réponse en
or si l'IA replie en pleine démo : « Vous voyez le badge : l'application vous dit honnêtement que
ce texte est le repli pré-rédigé — les faits, eux, restent calculés. En production payante, ce
repli disparaît. »

### 5.4 Anti-fraude : les 5 verrous (question fréquente : « et si le producteur ment ? »)

1. **Identité** : carte scannée, photo conservée, matricule unique (anti-doublon).
2. **Traçabilité de la capture** : le GPS est guidé par l'app, fait par un utilisateur identifié —
   chaque trace est horodatée et rattachée à son compte.
3. **Contrôles automatiques** : chevauchement avec les parcelles déjà enrôlées, superficie
   plausible, signal GPS authentique (positions simulées détectées et bloquées).
4. **La vérité satellite** : un contour mensonger inclut de la forêt perdue ou le champ du voisin —
   et ça se voit sur l'imagerie.
5. **Réconciliation économique** : le volume acheté est plafonné par superficie × rendement
   régional ; une parcelle de 2 ha ne peut pas « produire » 10 tonnes.

---

## 6. Le modèle économique (simple et honnête)

- **Gratuit pour le producteur.** Toujours commencer par ça.
- **Modèle par producteur vérifié : ≈ 1 200 FCFA / producteur / an (≈ 1,8 €)**, facturé à la
  coopérative ou à l'exportateur — c'est le modèle du deck (slide 7), aligné sur le benchmark du
  secteur (2 à 5 $ chez Koltiva, Meridia). **Hypothèse à valider au pilote** (le dire ainsi).
- **Ce que ça donne pour une coopérative** : ~1 000 producteurs → **~1,2 M FCFA / an**
  (soit ~100 000 FCFA/mois), certificats compris — moins qu'UNE seule campagne d'audit terrain
  manuelle. C'est aussi le tarif « Coopérative » affiché sur la page /tarifs.
- **API exportateur** (gros volumes, API REST, exports en masse, déclarations TRACES NT, copilote) ;
  −20 % en facturation annuelle.
- Le point de référence qui rend le prix crédible : **la certification manuelle coûte aujourd'hui
  20 à 40 millions de FCFA par an** à une organisation — AGRIVO remplace ce processus par un
  abonnement clair.
- Ce qu'on ne dit JAMAIS : un montant de prime promis (les primes se négocient, nous fournissons
  l'argumentaire) ; une commission sur crédit (il n'y a AUCUN crédit dans le produit).

---

## 7. Le marché et la concurrence (réponses prêtes)

- **Meridia Verify, KoltiVerify (Koltiva)** : ils font de l'audit de géodonnées — c'est la
  **meilleure preuve que le besoin est réel**. Nos 3 différences : (1) eux vendent aux exportateurs
  et aux marques, en top-down — AGRIVO met l'audit **dans les mains de la coopérative**, en
  self-service ; (2) chez eux l'audit est un rapport — chez nous chaque parcelle rejetée repart en
  **capture guidée in-app** et chaque parcelle valide reçoit un **verdict satellite + certificat
  public** ; (3) nous sommes **conçus pour la Côte d'Ivoire** : carte producteur, SNT, français,
  hors connexion, prix coopérative.
- **Farmerline** et autres : outils de gestion agricole généralistes — pas la boucle complète
  audit → correction → satellite → certificat → valorisation.
- **Trusty (blockchain ivoirienne)** : trace des LOTS pour les exportateurs. AGRIVO vérifie des
  PARCELLES pour les coopératives. **Complémentaires, pas concurrents.**
- **Le SNT du Conseil Café-Cacao** : trace les **transactions** du bord champ à l'export. AGRIVO
  produit ce que le SNT ne donne pas : le verdict déforestation parcelle par parcelle, le dossier
  prêt pour TRACES NT, la valorisation. **AGRIVO relie la traçabilité nationale à l'exigence
  européenne.** L'accès au registre du CCC (~3 M ha) est notre **demande de partenariat** — pas un
  prérequis : le produit fonctionne dès aujourd'hui avec les fichiers que les coopératives
  détiennent.

---

## 8. Ce qu'AGRIVO ne fait PAS (les frontières du produit)

1. **Aucun crédit, prêt, score financier, plafond de financement.** Le micro-crédit a été retiré
   du produit le 6 juillet, sur la foi d'informations terrain (une professionnelle de l'export
   cacao, 6+ ans d'expérience) : les coopératives n'accordent pas de préfinancement individuel aux
   producteurs — par choix (autonomie, historique d'impayés et de fraudes). AGRIVO valorise par
   les **primes**, pas par la dette. C'est définitif.
2. **AGRIVO ne « garantit » pas la conformité.** C'est une **évaluation** technique ; l'opérateur
   reste légalement responsable de sa déclaration (c'est écrit sur chaque certificat).
3. **AGRIVO ne fixe pas et ne négocie pas le prix du cacao** — le prix bord champ est fixé par
   l'État. On négocie les **primes au-dessus du prix garanti**.
4. **AGRIVO n'emploie personne sur le terrain** : 100 % logiciel. La capture est faite par les
   utilisateurs de l'app (producteur, pisteur ou agent de coopérative).
5. **Pas de blockchain, pas de modèle IA maison** : on orchestre des outils de référence (Whisp,
   Gemini) avec nos règles métier — assumé.

---

## 9. Les interdits de langage (réflexes absolus devant le jury)

| ❌ Ne JAMAIS dire | ✅ Dire à la place |
|---|---|
| « Garantie de conformité », « on garantit » | « **Évaluation** de conformité » |
| « Crédit », « prêt », « score financier », « préfinancement » | « **Valorisation** : primes, acheteurs premium, dossier partagé » |
| « Négocier le prix » | « Négocier les **primes au-dessus du prix garanti** » |
| « Whisp/notre IA est fiable à X % » | « Outil de référence FAO, verdict par **convergence de preuves** » (aucun % inventé) |
| « Délégué » (pour un agent) | « L'utilisateur de l'app : producteur, pisteur ou agent de coopérative » (seule exception : « délégué à la protection des données », terme légal) |
| Reformuler un statut (« validé », « OK », « rejeté ») | Les statuts verbatim : « **Conforme** », « **Anomalie détectée** », « **Données insuffisantes** » |
| « Notre partenaire [grand nom] » | « **Contact identifié** », « demande de partenariat » (rien n'est signé) |
| « Le SNT/Meridia sont dépassés » | « **Complémentaires** » (jamais dénigrer) |
| « C'est fini/parfait » | « v1.7.1 en production, 65 tests automatisés, et un plan v2 écrit » |

---

## 10. Les chiffres à connaître par cœur (flashcards)

| Le chiffre | Ce qu'il veut dire |
|---|---|
| **30 décembre 2026** | La RDUE s'applique (grandes/moyennes entreprises ; petites : 30 juin 2027) |
| **31 décembre 2020** | La date pivot : aucune déforestation après cette date |
| **7** | Denrées couvertes : cacao, café, hévéa, palmier à huile, bovins, soja, bois |
| **< 4 ha / ≥ 4 ha** | Point GPS suffit / polygone complet obligatoire (règle RDUE) |
| **1er septembre 2026** | Carte producteur obligatoire en CI |
| **1er octobre 2026** | Prime Fairtrade cacao : 250 €/t (+13 %), dont **40 % en cash direct** aux membres |
| **22 mai 2025** | La CI est classée « **risque standard** » (géolocalisation complète exigée) |
| **~30 %** | Part des données terrain pas assez fiables pour la RDUE (étude Meridia/Rabo, Cavally) |
| **63 % — 19/30** | Le registre de démonstration après audit AGRIVO (11 parcelles à corriger) |
| **1,1 M · ~900 000 · ~3 M ha** | Producteurs recensés · cartes émises · hectares géolocalisés (CCC) |
| **2 800 / 1 200 FCFA** | Prix bord champ FIXÉ par l'État, campagne 2025-26 (principale / intermédiaire) |
| **6 / 5 / 3** | 6 étapes du parcours · 5 usages IA en production · 3 statuts verbatim |
| **45 · 62 % · 157 ha · 81 t** | Les 4 KPI de la vue exportateur |
| **≈ 1 200 FCFA / producteur / an** | Tarif de base (≈ 1,8 € ; benchmark secteur 2-5 $). Coop de ~1 000 producteurs ≈ 1,2 M FCFA/an (~100 000 FCFA/mois). Exportateur : à partir de 1 M FCFA/mois. Hypothèse pilote |
| **20-40 M FCFA/an** | Coût de la certification manuelle (le point de comparaison) |
| **v1.7.1 · 65 tests** | Version en production · tests automatisés (CI GitHub Actions) |
| **5 min + 2 min** | Durée du pitch + questions ; grille : Impact 30 · Faisabilité 20 · IA 20 · Innovation 15 · Pitch 15 |

Accès (deux comptes démo « 1 clic » sur la page de connexion) :
coopérative `client@test.com / 123client123` (Amadou, Coopérative Agricole de Soubré) ·
exportateur `export@agrivo.com / 123export123` (Marc, Cacao Export CI) ·
admin `admin@agrivo.com / 123admin123` · guide présentateur intégré : **Ctrl+Shift+D** ·
URL unique : **https://agrivo-io.vercel.app**.

---

## 11. La démo du jury (déroulé 7 minutes — qui fait quoi)

| Min | Séquence | Qui | Le point à marquer |
|---|---|---|---|
| 0:00 | Splash + landing (30 s) | Anael | La promesse : « De la parcelle vérifiée à la prime négociée. » |
| 0:30 | **Golden path sur MOBILE** (3 min) : consentement → scan carte (QR/lecture auto) → cartographie GPS réelle → verdict satellite → certificat → valorisation | Christ | Le GPS et la caméra sont RÉELS sur le terrain |
| 3:30 | **Dashboard web** (1 min 15) : KPI, puis « Auditer mon registre » → registre démo → **63 %** → **« Générer le plan d'action IA »** | Anael | « L'IA organise la mise en conformité : bureau d'abord, terrain ensuite » |
| 4:45 | **Espace exportateur** (bascule sur le compte démo Exportateur, 1 min 30) : carte du portefeuille, export GeoJSON TRACES NT, copilote IA (« Quelles parcelles présentent un risque dans la région de Soubré ? ») | Anael/Gaddiel | Deux espaces distincts : le côté acheteur a son propre tableau de bord |
| 6:15 | **Effet final** (45 s) : le jury **scanne le QR du certificat avec SON téléphone** → /verifier-certificat | Tous | « N'importe quel acheteur peut vérifier nos certificats » |

- Avant de commencer : cookies acceptés sur la machine de démo, compte démo connecté, recherche du
  dashboard vidée, question du copilote prête.
- **Plan B** : la vidéo de secours (2 min 30, script dans `GUIDE_DEMO_JURY.md`) en local ET sur
  clé USB — à tourner par Christ jeudi soir au plus tard, sur la version EN PROD.
- Si l'IA affiche « Mode démonstration » pendant la démo : voir la réponse en or, partie 5.3.

---

## 12. Le grand oral : les questions du jury et nos réponses

> Format : réponse courte à dire (2 à 4 phrases). S'entraîner à voix haute. Le jury peut poser
> la question à N'IMPORTE QUI — chacun doit pouvoir répondre à tout ce qui suit.

### A. Le problème et le marché

**1. « C'est quoi la RDUE, en une phrase ? »**
La loi européenne qui, à partir du 30 décembre 2026, interdit d'importer en Europe du cacao (et 6
autres denrées) sans preuve géolocalisée que la production ne vient pas d'une zone déforestée
après le 31 décembre 2020.

**2. « Quelles denrées sont concernées ? »**
Sept : cacao, café, hévéa, palmier à huile, bovins, soja, bois — et leurs dérivés. AGRIVO gère les
7 filières, avec le cacao ivoirien comme fer de lance.

**3. « Pourquoi la Côte d'Ivoire est-elle si concernée ? »**
Premier producteur mondial de cacao, avec l'UE comme premier débouché et 1,1 million de
producteurs recensés. Sans conformité, la filière perd son premier client. Et trois échéances
convergent sur la campagne 2026-27 : carte producteur (01/09), prime Fairtrade cash (01/10),
RDUE (30/12).

**4. « L'Europe a simplifié la RDUE, votre produit sert encore ? »**
La déclaration simplifiée ne bénéficie qu'aux pays classés « risque faible ». La Côte d'Ivoire est
classée **risque standard** (22 mai 2025) : la diligence complète, géolocalisation comprise, reste
pleinement exigée. Et si la CI devient « risque faible » un jour, ce sera GRÂCE à une traçabilité
prouvée — exactement ce qu'AGRIVO produit.

**5. « Et si la loi est encore reportée ? »**
Le besoin ne disparaît pas : les acheteurs et les certifications (Rainforest Alliance, Fairtrade)
exigent déjà la cartographie, la carte producteur ivoirienne arrive au 1er septembre 2026, et des
données fiables restent la condition des primes. La RDUE est l'accélérateur, pas la seule raison
d'exister.

**6. « Quel est le VRAI problème que vous résolvez ? »**
Pas la collecte : la **fiabilité**. Les coopératives ont déjà des fichiers de parcelles, mais
environ 30 % des données terrain ne sont pas assez fiables pour la RDUE (étude Meridia/Rabo dans
le Cavally). AGRIVO audite l'existant et ne renvoie sur le terrain que pour ce qui manque.

**7. « Quelle est la taille de votre marché ? »**
En Côte d'Ivoire : des milliers de coopératives cacao et l'ensemble des exportateurs, sur ~3 M ha
à fiabiliser ; puis les 6 autres filières RDUE et les autres pays producteurs d'Afrique de
l'Ouest. On chiffre précisément au pilote — on ne cite pas de montant inventé.

**8. « Pourquoi personne ne l'a fait avant vous ? »**
Des acteurs mondiaux (Meridia, Koltiva) le font — pour les exportateurs et les marques, en
top-down. Personne ne met l'audit en self-service **dans les mains de la coopérative ivoirienne**,
en français, hors connexion, au prix coopérative, avec la boucle complète jusqu'au certificat
public.

### B. Le produit

**9. « AGRIVO en une phrase ? »**
L'auditeur IA qui transforme les géodonnées que les coopératives possèdent déjà en conformité RDUE
prouvable — et en argument de négociation. « De la parcelle vérifiée à la prime négociée. »

**10. « Qui sont vos utilisateurs ? »**
Le **gérant de coopérative** (notre persona Amadou) au bureau ; les **agents/pisteurs de la
coopérative et les producteurs** sur le terrain avec l'app mobile ; l'**exportateur** qui consulte
les dossiers partagés ; et n'importe quel **acheteur** qui vérifie un certificat par QR code.

**11. « Racontez-moi le parcours de vérification. »**
Six étapes : on scanne la carte du producteur (QR, sinon l'OCR Gemini lit la photo) ; on
cartographie la parcelle au GPS — point si moins de 4 ha, tour de champ complet au-delà, c'est la
règle RDUE ; le satellite (Whisp/FAO) rend un des trois statuts ; si c'est conforme, certificat
PDF avec QR de vérification publique ; et la parcelle rejoint le dossier de valorisation partagé
avec l'exportateur.

**12. « D'où viennent les polygones et les données ? »**
Quatre canaux, dans cet ordre : (1) les fichiers que la coopérative détient déjà (certification
Rainforest Alliance, cartographies financées par les exportateurs) — AGRIVO les importe et les
audite ; (2) la capture in-app pour les trous ; (3) le satellite qui juge ce qui est déclaré ;
(4) le registre du CCC (~3 M ha) — notre demande de partenariat, pas un prérequis.

**13. « Et si le producteur ment sur sa parcelle ? »**
Personne n'est cru sur parole : cinq verrous se croisent — identité par carte scannée et matricule
unique, capture horodatée par un utilisateur identifié, contrôles automatiques (chevauchement,
superficie plausible, GPS simulé bloqué), la vérité satellite qui voit un contour mensonger, et la
réconciliation économique (le volume acheté est plafonné par superficie × rendement régional).

**14. « Que fait exactement l'audit du registre ? »**
Il parse le fichier (.geojson, .kml, .csv) dans le navigateur — les données ne quittent pas la
coopérative — et détecte selon la règle RDUE : polygones non fermés, doublons de matricule,
parcelles ≥ 4 ha déclarées en simple point, chevauchements, coordonnées hors zone. Chaque anomalie
reçoit une action : « au bureau » ou « sur le terrain ». Sur le registre démo : 63 % prêtes, 19
sur 30.

**15. « Que voit l'exportateur ? »**
Un tableau de bord de démonstration : 45 producteurs audités, 62 % de conformité, 157 ha
cartographiés, 81 t validées, la carte satellite du portefeuille, l'export GeoJSON conforme
TRACES NT et un copilote IA qui répond sur les parcelles à risque.

**16. « À quoi sert le QR code du certificat ? »**
À la vérification publique : n'importe qui le scanne et retombe sur agrivo-io.vercel.app qui
confirme le statut, la date et la parcelle. C'est ce qui rend le certificat crédible au-delà de
notre parole — essayez avec votre téléphone.

### C. L'intelligence artificielle

**17. « Votre IA est-elle réelle ? »**
Oui : **cinq usages appellent réellement Gemini en production** — l'OCR de la carte, le plan
d'action d'audit, le mémo de diligence, l'argumentaire de prime et le copilote exportateur. Les
verdicts et les chiffres restent calculés sur les données : l'IA met en mots, elle n'invente rien.
Et en cas de panne, repli automatique étiqueté « Mode démonstration » — l'application ne ment
jamais.

**18. « Quelle différence entre Whisp et Gemini ? »**
Whisp (FAO) est la **détection satellite** : il juge la déforestation dans le polygone — ce n'est
pas notre modèle, c'est l'outil de référence de l'ONU. Gemini (Google) est le **langage et la
vision** : lire une carte, rédiger un plan, expliquer un verdict. Deux rôles distincts, jamais
confondus.

**19. « Comment être sûr que l'IA n'invente pas de chiffres ? »**
Par l'architecture : les faits (comptes d'anomalies, pourcentages, superficies) sont calculés par
du code testé, puis envoyés à Gemini avec l'ordre strict de ne réécrire QUE la formulation. Si sa
réponse ne respecte pas la trame — même nombre d'étapes, mêmes chiffres — elle est rejetée et la
version déterministe s'affiche. Plus notre charte système : statuts verbatim, jamais « garantie ».

**20. « Et si l'IA tombe en panne pendant votre démo ? »**
Rien ne casse : chaque fonction a un repli pré-rédigé, étiqueté honnêtement « Mode démonstration »
à l'écran. Les faits affichés restent exacts puisqu'ils sont calculés. Vous pouvez d'ailleurs
vérifier l'état réel du mode IA sur notre écran d'administration.

**21. « Quelle est la précision de Whisp ? »**
Nous ne citons aucun pourcentage — nous refusons d'inventer un chiffre. Whisp est l'outil de
référence FAO (pilote Kenya, 6 000+ parcelles) et fonctionne par **convergence de preuves** :
plusieurs sources satellite (Sentinel-2, JRC) doivent concorder.

**22. « Le satellite peut-il se tromper ? »**
Oui, et le produit l'assume : c'est exactement le rôle du statut « Données insuffisantes » (nuages,
données incomplètes) — dans ce cas, pas de certificat, nouveau passage satellite. Et le certificat
rappelle que c'est une **évaluation** : la responsabilité légale de la déclaration reste à
l'opérateur.

**23. « Pourquoi Gemini et pas un autre modèle ? »**
Il combine vision (OCR de cartes) et texte structuré, avec une latence et un coût adaptés à une
coopérative. Mais l'architecture est agnostique : Gemini ne fait que la mise en mots — changer de
modèle ne changerait ni les verdicts ni les chiffres.

**24. « Avez-vous entraîné votre propre modèle ? »**
Non, et c'est un choix assumé : sur un sujet réglementaire, on ne bricole pas un modèle maison en
5 jours — on orchestre des outils de référence (Whisp pour le satellite, Gemini pour le langage)
avec NOS règles métier codées et testées autour. L'innovation est dans la boucle complète, pas
dans un modèle de plus.

### D. La technique

**25. « C'est construit avec quoi ? »**
Une PWA Next.js 16 / React 19 / TypeScript strict, cartes satellite Esri via Leaflet, certificats
PDF générés côté client, déployée sur Vercel. Version v1.7.1 en production, 65 tests automatisés,
intégration continue GitHub Actions à chaque push.

**26. « Ça marche sans réseau ? Sur le terrain il n'y a pas de 4G. »**
Oui, par conception : la capture GPS est 100 % locale, l'app mobile met les analyses en file
d'attente et synchronise au retour du réseau, et le web est une PWA avec page hors connexion. La
démo mobile inclut d'ailleurs un passage en mode avion.

**27. « Où est votre clé API ? Dans l'app ? »**
Jamais. La clé Gemini vit uniquement côté serveur (variable d'environnement Vercel) ; le mobile et
le navigateur appellent nos routes API. Une app mobile se décompile en deux minutes — aucun secret
n'y est embarqué.

**28. « Pourquoi 6 décimales sur les coordonnées ? »**
C'est le standard GeoJSON RFC 7946 attendu par TRACES NT : WGS-84, ordre longitude-latitude,
6 décimales (± 11 cm), anneaux de polygones fermés. Notre export est testé unitairement sur ces
règles précises.

**29. « Vous avez une application web ET une application mobile ? »**
Non : **une seule application**. AGRIVO est une PWA — une app web qui s'installe depuis le
navigateur (sans Google Play, sans APK) et qui s'adapte au PC, à la tablette et au mobile. La MÊME
app sert le gérant au bureau (import, audit, dashboard) et l'agent au bord du champ, où elle capture
le **vrai GPS** en marchant la parcelle (mode « Tour de champ GPS réel », depuis la v1.7.0). Un seul
code, un seul login, une seule donnée — du bureau au champ, sans store. En Côte d'Ivoire, sur les
téléphones qu'ont déjà les agents, c'est un avantage concret.

**30bis. « Qu'est-ce qui est réel et qu'est-ce qui est simulé ? » (répondre AVANT qu'ils creusent)**
Réel : les 5 usages Gemini en production, l'audit de registre (parsing et règles RDUE exécutés en
direct), la **capture GPS réelle sur mobile** (mode terrain v1.7.0), la génération PDF + QR, la
vérification publique. Simulé et assumé : les verdicts Whisp (pré-enregistrés — l'API FAO est sur
inscription, prévue au pilote), les données de démonstration (30 parcelles), l'authentification
(locale cette édition). Le plan v2 écrit détaille le passage au serveur.

**30. « Comment assurez-vous la qualité ? »**
65 tests automatisés sur les fonctions critiques (règles d'audit, export GeoJSON, statuts figés,
comportement sans clé), TypeScript strict, CI à chaque push, tags de version — et une charte
éditoriale appliquée par tests : les trois statuts n'existent qu'au mot près.

### E. Le business

**31. « Comment gagnez-vous de l'argent ? »**
Un abonnement de **~1 200 FCFA par producteur vérifié et par an** (le modèle éprouvé du secteur :
Koltiva, Meridia facturent 2 à 5 $), facturé à la coopérative ou à l'exportateur, gratuit pour le
producteur. Hypothèse à valider au pilote — le point d'ancrage : la certification manuelle coûte
20 à 40 millions FCFA par an.

**32. « ~1,2 M FCFA/an pour une coopérative, elle peut payer ça ? »**
C'est ~1,2 M FCFA/an (100 000 FCFA/mois, pour ~1 000 producteurs) contre 20 à 40 M pour un processus manuel de
certification — et contre la perte d'accès au marché européen. La prime Fairtrade seule (250 €/t
dont 40 % cash) représente, pour quelques dizaines de tonnes, bien plus que l'abonnement. Et nous
validerons ce chiffre au pilote, honnêtement.

**33. « Qui sont vos concurrents ? »**
Meridia Verify et Koltiva sur l'audit de données — la preuve que le besoin est réel. Nos
différences : self-service côté coopérative, boucle complète jusqu'au certificat public vérifiable,
ancrage Côte d'Ivoire (carte producteur, français, hors connexion, prix). Trusty (blockchain, lots
exportateurs) et le SNT (transactions) sont complémentaires.

**34. « Pourquoi AGRIVO alors que le SNT du CCC existe ? »**
Le SNT trace les transactions ; il ne donne ni le verdict déforestation parcelle par parcelle, ni
le dossier de diligence prêt pour TRACES NT, ni la valorisation. AGRIVO relie la traçabilité
nationale à l'exigence européenne — et notre demande de partenariat CCC vise à rendre exploitables
les ~3 M ha que l'État a déjà payés.

**35. « Avez-vous des clients ? »**
Pas encore de client signé — honnêtement. Nous visons un pilote avec une coopérative (ECOOKIM est
identifiée dans notre pitch), le mentorat AFRINOVATECH, et une demande de partenariat au CCC. Le
produit, lui, est déjà déployé et utilisable aujourd'hui.

**36. « Quel est votre plan de déploiement ? »**
Pilote avec une coopérative sur la campagne 2026-27 (l'année de la convergence), preuve de valeur
sur son registre réel, puis extension par les unions de coopératives et les exportateurs qui ont
intérêt à équiper leurs coops fournisseuses.

### F. L'équipe et la suite

**37. « Qui fait quoi dans l'équipe ? »**
Anael, chef de projet : produit, stratégie, pitch. Christ : l'app mobile terrain et la vidéo de
démonstration. Gaddiel : backend et IA. Domy : recherche, vérification des faits et des chiffres.
Quatre personnes, et un produit en production.

**38. « Que ferez-vous après le hackathon ? »**
Le plan v2 est déjà écrit : authentification serveur, base de données géographique (PostGIS),
branchement de l'API Whisp officielle, registre serveur des certificats, synchronisation mobile —
environ 3-4 semaines de socle — puis le pilote coopérative.

**39. « Qu'est-ce qui vous manque pour un vrai déploiement ? »**
Trois choses, identifiées : l'inscription à l'API Whisp (FAO), l'immatriculation de la structure
(les mentions légales l'annoncent), et le passage du stockage au serveur (plan v2). Aucun verrou
technologique — du travail d'exécution.

**40. « Pourquoi vous et pas un grand acteur ? »**
Parce que le problème est local : carte producteur ivoirienne, prix fixé par l'État, coopératives
francophones, terrain sans réseau. Les grands acteurs servent les marques mondiales en top-down ;
nous, on met l'outil dans les mains du gérant de coopérative — et on a construit et déployé ce
produit en une semaine, ce qui dit notre vitesse d'exécution.

### G. Les questions pièges

**41. « Pourquoi ne pas donner de crédit aux producteurs ? Ce serait plus utile ! »**
C'est un choix, aligné avec les coopératives elles-mêmes : elles n'accordent pas de préfinancement
individuel — elles visent l'autonomie des producteurs, et le préfinancement a historiquement
produit impayés et fraudes. AGRIVO valorise la conformité par les **primes** — de l'argent gagné,
pas de la dette. Aucun score de crédit dans le produit, par conception.

**42. « Donc vous GARANTISSEZ que le cacao est propre ? »**
Non — et c'est important : AGRIVO fournit une **évaluation** fondée sur l'outil de référence FAO
et des preuves datées ; la responsabilité légale de la déclaration reste à l'opérateur, comme la
loi le prévoit. C'est écrit sur chaque certificat. Méfiez-vous de quiconque vous « garantit » la
conformité.

**43. « Le producteur n'a pas de smartphone. Votre app sert à qui ? »**
À la coopérative : c'est le gérant, l'agent ou le pisteur équipé qui fait la capture au bord du
champ — pas besoin qu'un producteur sur deux ait un téléphone. Le service est d'ailleurs gratuit
pour le producteur.

**44. « Et les données personnelles ? Vous êtes conformes ARTCI ? »**
Le consentement éclairé du producteur est recueilli et tracé (loi ivoirienne n°2013-450), l'audit
du registre s'exécute dans le navigateur — les données ne quittent pas la coopérative — et nos
pages légales détaillent durées et droits. Un DPO sera désigné à l'immatriculation de la
structure ; le plan v2 prévoit l'hébergement conforme aux exigences de souveraineté.

**45. « Votre application est-elle finie ? »**
Elle est en **production**, version 1.7.1, 65 tests, et vous pouvez la vérifier en direct — c'est
plus qu'une maquette. Et non, un produit n'est jamais « fini » : le plan v2 est écrit et priorisé.
Nous préférons un périmètre honnête qui marche à une promesse qui casse.

**46. « Quel organisme est agréé pour certifier qu'une parcelle respecte la RDUE ? »**
Aucun — et ce n'est pas un vide, c'est la conception même du règlement : il n'existe **aucune
certification ni agrément RDUE**, pour personne. SGS, géant mondial de l'audit, l'écrit sur son
propre site : « aucun rôle de certification ou d'accréditation n'est prévu par le cadre RDUE ».
C'est l'**opérateur** qui déclare (DDS sur TRACES NT) et qui reste **seul responsable**. AGRIVO
est exactement dans les clous : nous parlons d'**évaluation**, jamais de certification de
conformité — et c'est désormais écrit mot pour mot sur chaque certificat.

**47. « Mais Bureau Veritas, lui, certifie la RDUE, non ? »**
Bureau Veritas est un acteur sérieux — mais il fait de l'**audit** et de la **vérification** en
appui de la diligence de l'opérateur, pas une « certification de conformité RDUE » : ça n'existe
pas (même une certification Rainforest Alliance ne vaut pas conformité, la Commission le dit).
Et il sert les gros importateurs, à des coûts hors de portée d'une coopérative. AGRIVO produit
la preuve **au niveau du champ**, en langue locale, à un prix de coopérative : nous sommes **en
amont** d'un Bureau Veritas, pas en face — sa vérification peut même s'appuyer sur notre dossier.

---

## 13. Lexique ultra-simple (un terme = une phrase)

- **RDUE / EUDR** : la loi européenne anti-déforestation (Règlement UE 2023/1115).
- **Date pivot** : le 31 décembre 2020 — toute déforestation APRÈS cette date disqualifie la parcelle.
- **DDS** : déclaration de diligence raisonnée — le dossier que l'importateur dépose pour prouver sa vérification.
- **TRACES NT** : le portail informatique de l'UE où l'on dépose les DDS.
- **Opérateur** : l'entreprise qui met le produit sur le marché européen (elle porte la responsabilité légale).
- **Géolocalisation** : situer la parcelle par coordonnées GPS.
- **Polygone** : le contour complet d'un champ (obligatoire dès 4 ha) ; sinon un point GPS suffit.
- **WGS-84 / GeoJSON RFC 7946** : le format standard mondial des coordonnées (celui que TRACES NT attend).
- **Whisp** : l'outil satellite de référence de la FAO (ONU) qui détecte la déforestation — « what is in that plot ».
- **Sentinel-2 / Copernicus, JRC** : les sources d'images satellite européennes que Whisp croise.
- **Gemini** : le modèle d'IA de Google que nous utilisons pour lire (vision) et rédiger (texte).
- **OCR** : lecture automatique d'un document photographié (ici, la carte du producteur).
- **Mode démonstration** : notre repli honnête quand l'IA live est indisponible — étiqueté à l'écran.
- **PWA** : une app web installable qui garde une page hors connexion.
- **CCC** : le Conseil du Café-Cacao, le régulateur ivoirien de la filière.
- **SNT** : le Système National de Traçabilité du CCC (suit les transactions, pas la déforestation).
- **Carte producteur** : la carte d'identité professionnelle du producteur (obligatoire au 01/09/2026) ; son QR contient son matricule.
- **Matricule** : le numéro unique du producteur (ex. CI-CCC-024517) — notre clé anti-doublon.
- **Prix bord champ** : le prix d'achat au producteur, FIXÉ par l'État chaque campagne.
- **Prime de durabilité** : le supplément négocié AU-DESSUS du prix garanti (Fairtrade, programmes acheteurs).
- **Fairtrade / Rainforest Alliance** : les grands labels de certification (RA impose déjà la cartographie).
- **Pisteur** : l'intermédiaire qui collecte le cacao au village pour la coopérative.
- **ARTCI** : l'autorité ivoirienne qui protège les données personnelles (loi n°2013-450).
- **DPO** : délégué à la protection des données (seul usage autorisé du mot « délégué »).
- **Certificat AGV** : notre certificat d'évaluation (n° AGV-2026-XXXX) avec QR de vérification publique.
- **Registre** : le fichier des parcelles de la coopérative (.geojson/.kml/.csv) — la matière première d'AGRIVO.
- **Mock** : donnée pré-enregistrée utilisée pour la démonstration (toujours assumée, jamais cachée).

---

## 14. Quiz de validation (à faire sans regarder — réponses en bas)

1. Quelles sont les trois formulations EXACTES des statuts ?
2. Un juré dit : « Donc vous garantissez la conformité ? » — ta réponse en une phrase ?
3. À partir de quelle superficie le polygone complet est-il obligatoire ?
4. Cite la date pivot déforestation ET la date d'application de la RDUE.
5. Pourquoi dit-on « négocier les primes » et jamais « négocier le prix » ?
6. Combien d'usages IA sont en production, et lesquels ?
7. Que se passe-t-il si Gemini ne répond pas pendant la démo ?
8. Que montre le moment « 63 % » exactement ?
9. Quelle est la différence entre Whisp et Gemini ?
10. Pourquoi AGRIVO ne propose-t-il aucun crédit ?
11. Que répondre à « Meridia le fait déjà » ?
12. Quel est le rôle du QR code sur le certificat ?
13. Cite 3 des 5 verrous anti-fraude.
14. Pourquoi la « simplification » européenne ne s'applique-t-elle pas à la CI ?
15. Que coûte AGRIVO à une coopérative, et quel est le point de comparaison ?

**Réponses** : 1. Conforme · Anomalie détectée · Données insuffisantes. 2. « Non : une évaluation
technique — la responsabilité légale reste à l'opérateur, c'est écrit sur chaque certificat. »
3. 4 hectares. 4. 31 décembre 2020 · 30 décembre 2026 (grandes/moyennes entreprises). 5. Le prix
bord champ est fixé par l'État ; seules les primes au-dessus se négocient. 6. Cinq : OCR carte,
plan d'action d'audit, mémo DDS, argumentaire de prime, copilote exportateur. 7. Repli automatique
étiqueté « Mode démonstration » ; les faits restent calculés ; rien ne casse. 8. L'audit du
registre démo : 19 parcelles prêtes sur 30, anomalies typées avec action bureau/terrain, puis plan
d'action IA. 9. Whisp = détection satellite (FAO, pas à nous) ; Gemini = langage/vision (nos 5
usages). 10. Choix aligné avec les coops : autonomie des producteurs, historique d'impayés ; on
valorise par les primes, pas par la dette. 11. « La preuve que le besoin est réel » + nos 3
différences : self-service coopérative, boucle complète jusqu'au certificat public, ancrage CI.
12. Vérification publique : n'importe qui scanne et confirme le statut sur le site. 13. Carte +
matricule unique · capture horodatée par utilisateur identifié · contrôles automatiques (GPS
simulé, chevauchement, superficie) · vérité satellite · réconciliation économique. 14. Elle ne
vaut que pour les pays « risque faible » ; la CI est « risque standard » depuis le 22 mai 2025.
15. ≈ 1 200 FCFA/producteur/an (~1,2 M FCFA/an, soit 100 000 FCFA/mois, pour une coop de 1 000 producteurs) vs 20 à 40 M FCFA/an pour la certification manuelle.

---

## 15. LA FICHE (à relire samedi matin — tout tient ici)

**Le pitch en 3 phrases** : « L'Europe exige la preuve GPS anti-déforestation au 30 décembre 2026.
Les coopératives ivoiriennes ont déjà les données, mais ~30 % ne sont pas fiables. AGRIVO est
l'auditeur IA qui les rend prouvables — et négociables : de la parcelle vérifiée à la prime
négociée. »

**Les 3 réflexes** : statuts verbatim (Conforme · Anomalie détectée · Données insuffisantes) ·
« évaluation », JAMAIS « garantie » · primes AU-DESSUS du prix garanti, jamais « négocier le prix ».

**Les 3 interdits** : aucun crédit/score financier · aucun pourcentage inventé · aucun partenariat
affirmé (dire « contact identifié », « demande de partenariat »).

**Les 5 chiffres** : 30/12/2026 · 31/12/2020 · ~30 % non fiables (Cavally) · 63 % (19/30) démo ·
250 €/t dont 40 % cash au 01/10/2026.

**L'IA en 1 phrase** : « Cinq usages Gemini en production, faits calculés, mise en mots par l'IA,
repli honnête étiqueté — et Whisp/FAO pour le satellite. »

**L'app en 1 phrase** : « Une seule application (PWA), du bureau du gérant au bord du champ, sans
store — avec la capture GPS réelle sur le téléphone depuis la v1.7.0. »

**Le tarif** : ≈ 1 200 FCFA/producteur/an (benchmark 2-5 $) → ~1,2 M/an (100 000 FCFA/mois) pour 1 000 producteurs,
vs 20-40 M pour un audit manuel. Exportateur : à partir de 1 M FCFA/mois. Hypothèse à valider au pilote.

**La démo** : mobile (Christ, golden path GPS réel) → web « Auditer mon registre » 63 % + plan
d'action IA → vue exportateur + copilote → **le jury scanne le QR**. Plan B : vidéo.
URL : agrivo-io.vercel.app.

*AGRIVO — document de formation interne · 7 juillet 2026 · rédigé par Anael (chef de projet).
Jumeau PDF : `AGRIVO_Formation_Equipe.pdf`. Compléments : `AGRIVO_Presentation_Equipe_MAJ.pdf`
(état du produit), `GUIDE_DEMO_JURY.md` (déroulé détaillé), `AGRIVO_Guide_App_Mobile.pdf` (Christ).*

---

## Mise à jour v1.7.0 (8 juillet) — à connaître absolument

Le site est passé en **version finale v1.7.0** : **13 usages IA** (contre 8 avant) et **65 tests** au vert. Ce qui a changé :

- **5 nouvelles fonctions IA** : le **Copilote RDUE** (bulle ✨ sur le tableau de bord et la FAQ — répond aux questions sur le règlement avec la source citée), la **Revue IA du registre** (repère les signaux faibles : superficies identiques, noms quasi-doublons), le **Dossier acheteur EUDR** (onglet exportateur — résumé exécutif IA + export), le **verdict traduit en dioula/baoulé** (l'explication seulement, jamais le statut), et le **diagnostic visuel de parcelle** par photo (observation, jamais un verdict).
- **Rituel pré-vol AVANT toute démo** : se connecter en admin → « Préchauffer l'IA (démo) » → attendre le bandeau **« Démo prête : 6/6 en direct »**. C'est notre garantie anti-panne en salle.
- **Site vitrine finalisé** : onglet « Accueil » (l'écran de bienvenue n'apparaît plus que sur rafraîchissement ou arrivée par URL), heros unifiés sur Méthodologie/À propos/Tarifs, tout le jargon technique retiré des pages publiques, section « L'enjeu, à l'échelle du pays » (1ᵉʳ producteur mondial · 6 M+ de personnes · 66 % vers l'UE — chiffres sourcés USDA/Trase).
- **Le détail complet des 13 fonctions IA** (une par une, avec le bénéfice client) est dans le document **AGRIVO_Nouveautes_et_IA.pdf** — à lire en priorité.

## Mise à jour v1.7.1 (mercredi 8 juillet, soir)

- **Positionnement blindé « personne ne certifie la RDUE »** : il n'existe **aucun organisme agréé**
  pour certifier la conformité RDUE d'une parcelle — ni en Côte d'Ivoire, ni ailleurs (SGS l'écrit
  lui-même ; Bureau Veritas fait de l'audit d'appui, pas de la certification de conformité).
  C'est l'exportateur qui déclare et qui reste seul responsable. Le certificat AGRIVO (aperçu, PDF)
  et la page publique de vérification portent désormais la mention exacte : *« Il ne remplace pas
  la déclaration de diligence raisonnée (DDS) de l'exportateur, seul responsable de la conformité
  au sens du règlement (UE) 2023/1115. »* → Réponses jury prêtes : **questions 46 et 47** (section G).
- **Équipe à l'écran** : Fatim retirée du site (accueil + À propos). Rôles affichés alignés :
  Anael (direction produit), Christ (**application mobile**), Gaddiel (**backend & API**), Domy
  (conformité & réglementaire).
- **Purge crédit finale** : l'entrée FAQ « Pourquoi pas de crédit aux producteurs ? » est retirée du
  site public (le site n'introduit plus le sujet) — la réponse orale reste au répertoire (question 41).
  Dernier résidu anglais corrigé (« micro-loan eligibility » dans l'assistant exportateur EN).
