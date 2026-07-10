# AGRIVO — Ce que je viens d'améliorer, et toute l'IA du site expliquée simplement

*Par Anael — version du site : v1.16.0 · 10 juillet 2026 · https://agrivo-io.vercel.app*

> 🟢 **MISE À JOUR — VEILLE DU JURY (vendredi 10 juillet 2026, v1.16.0).** En cas de contradiction avec le texte plus bas, **ce bloc fait foi**. Document de synthèse à lire en priorité : **`AGRIVO_Equipe_JourJ.pdf`**.
> - **Prix (à jour)** : coopérative **100 000 FCFA/mois** (≈ **1 200 FCFA** par producteur et par an) · API exportateur **à partir de 1 000 000 FCFA/mois**. *(Anciens 125 000 / 1 500 FCFA/producteur caducs.)*
> - **79 tests** au vert · **deux comptes démo** : Coop `client@test.com` / `123client123` · Exportateur `export@agrivo.com` / `123export123`.
> - **Le pitch est un pitch PUR de 5 minutes — AUCUNE démo.** PowerPoint **envoyé à l'avance** sur **vibeathonci.com/soumettre**.

Ce document est pour vous, l'équipe. Je vous explique en langage simple **tout ce que j'ai amélioré ces derniers jours**, puis **chaque fonctionnalité IA du site, une par une** : ce qu'elle fait, et surtout **ce que ça apporte au client**. Après l'avoir lu, chacun de vous doit pouvoir présenter n'importe quelle partie du produit.

---

## 1. Ce que je viens d'améliorer (résumé simple)

**a) Le site est passé en « version finale », niveau professionnel.**
J'ai relu tout le site comme si j'étais un client. J'ai enlevé tout le jargon technique (les mots comme GeoJSON, WGS-84, API) et tous les textes qui étaient écrits pour nous, l'équipe, pas pour un client. Les pages Méthodologie, À propos et Tarifs ont maintenant le même fond élégant que la page d'accueil. Les cartes de la page d'accueil ont un design plus premium (effets au survol, accents colorés). J'ai corrigé les fautes et les tournures (« en 5 étapes », « expliqué et certifié », etc.).

**b) Un bouton « Accueil » plus intelligent.**
Il y a maintenant un onglet « Accueil » dans le menu (avant « Méthodologie »). Quand on navigue dans le site et qu'on clique « Accueil », on revient directement à la page d'accueil **sans** repasser par l'écran de bienvenue. L'écran de bienvenue ne s'affiche plus que dans deux cas : quand on rafraîchit la page, ou quand on arrive par l'adresse du site. C'est le comportement d'un vrai site pro.

**c) L'histoire que raconte le site est plus forte.**
J'ai ajouté sur l'accueil une section « L'enjeu, à l'échelle du pays » avec trois chiffres **réels et sourcés** : la Côte d'Ivoire est le **1er producteur mondial de cacao** (~45 % de l'offre), **plus de 6 millions de personnes** vivent du cacao chez nous, et **66 % de notre cacao part vers l'Union européenne**. C'est ce marché-là que le règlement européen conditionne à partir du 30 décembre 2026. AGRIVO existe pour garder cette porte ouverte.

**d) La démo ne peut presque plus casser.**
Avant, si l'IA de Google (Gemini) était saturée pendant la démo, certains textes passaient en « mode démonstration ». Maintenant : dans la console admin, un seul bouton « Préchauffer l'IA (démo) » réveille **les 6 fonctions IA de rédaction** d'un coup et affiche un bandeau : « **Démo prête : 6/6 en direct** ». C'est notre rituel avant de monter sur scène. Et chaque fonction IA a un filet de secours automatique : si l'IA ne répond pas, un texte fiable pré-calculé s'affiche à la place, honnêtement étiqueté. La démo continue toujours.

**e) Cinq nouvelles fonctions IA.**
Le site est passé de 8 à **13 usages de l'IA** (détail au chapitre suivant) : le Copilote RDUE, la Revue du registre, le Dossier acheteur, le verdict en langue locale (dioula/baoulé) et le diagnostic visuel de parcelle par photo.

**f) La qualité est prouvée, pas promise.**
**79 tests automatiques** passent au vert, le code compile sans aucune erreur, et tout est déployé en production. Le prix affiché est partout cohérent : 100 000 FCFA/mois par coopérative (≈ 1 200 FCFA par producteur vérifié et par an).

---

## 2. Les 13 fonctionnalités IA du site, une par une

> **Notre philosophie, à répéter au jury :** chez AGRIVO, l'IA **ne décide jamais** de la conformité. Les verdicts et les chiffres sont calculés sur des données vérifiables ; l'IA les rend **compréhensibles et utilisables**. Et chaque fonction a un plan B automatique : la démo ne dépend jamais d'un serveur externe.

### Dans le parcours de vérification (ce que voit le gérant de coopérative)

**1. Le scan de la carte producteur (lecture d'image)**
*Ce que ça fait :* au bord du champ, on photographie la carte professionnelle du producteur. L'IA lit la photo et remplit toute seule le nom, le numéro, la localité et la filière.
*Ce que ça apporte au client :* zéro saisie manuelle, zéro faute de frappe, gain de temps énorme pour un gérant qui gère des centaines de producteurs.

**2. Le verdict satellite (détection de déforestation — Whisp, l'outil de la FAO)**
*Ce que ça fait :* la parcelle est comparée aux images satellites depuis le 31 décembre 2020, en croisant plusieurs sources indépendantes. Trois réponses possibles, jamais plus : **Conforme**, **Anomalie détectée**, ou **Données insuffisantes**.
*Ce que ça apporte au client :* c'est le cœur du produit — la preuve, exigée par l'Europe, que sa parcelle n'est pas sur une zone déforestée. Et quand le satellite ne peut pas conclure (nuages), on le dit honnêtement au lieu de deviner.

**3. L'explication du verdict en langage clair**
*Ce que ça fait :* sous chaque verdict, une phrase simple explique ce que le satellite a vu.
*Ce que ça apporte au client :* le gérant comprend le résultat sans être ingénieur, et peut l'expliquer au producteur.

**4. La lecture à voix haute**
*Ce que ça fait :* un bouton « Écouter » lit l'explication du verdict à voix haute.
*Ce que ça apporte au client :* sur le terrain, tout le monde ne lit pas facilement un écran. La voix rend le résultat accessible.

**5. Le verdict expliqué en langue locale (nouveau)**
*Ce que ça fait :* deux boutons « Dioula » et « Baoulé » traduisent l'explication du verdict dans la langue du producteur. Le statut officiel, lui, reste en français.
*Ce que ça apporte au client :* le producteur comprend **dans sa langue** ce qui arrive à sa parcelle. C'est l'inclusion concrète, pas un slogan.

**6. Le diagnostic visuel de la parcelle (nouveau)**
*Ce que ça fait :* on photographie la plantation, et l'IA décrit ce qu'elle observe : culture probable, densité de la canopée, arbres d'ombrage, état du couvert. Attention : c'est une **observation**, jamais un verdict — la déforestation reste jugée uniquement par le satellite.
*Ce que ça apporte au client :* un œil agronomique en plus au moment de la visite terrain, sans expert à déplacer.

**7. Le score de résilience des sols, expliqué**
*Ce que ça fait :* chaque parcelle reçoit un score de santé des sols, et l'IA explique quels facteurs le composent.
*Ce que ça apporte au client :* au-delà de la conformité, le gérant sait quelles parcelles fragiliser le moins et où agir en priorité.

### Sur le tableau de bord de la coopérative

**8. Le plan d'action après l'audit du registre**
*Ce que ça fait :* la coopérative importe son registre de parcelles (ses fichiers existants). AGRIVO l'audite selon la règle européenne, puis l'IA rédige un plan d'action clair : quoi corriger au bureau, quoi compléter sur le terrain, dans quel ordre.
*Ce que ça apporte au client :* au lieu d'une liste d'erreurs déprimante, le gérant reçoit une feuille de route motivante et concrète.

**9. La revue intelligente du registre (nouveau)**
*Ce que ça fait :* après l'audit, l'IA repère les **signaux faibles** qu'un contrôle classique laisse passer : trois parcelles avec exactement la même superficie (suspect), deux noms presque identiques (« Kouassi Yao » / « Kouassi Yai » — même personne saisie deux fois ?), des numéros qui se suivent mais des parcelles à 50 km l'une de l'autre.
*Ce que ça apporte au client :* un registre plus propre **avant** que l'acheteur européen ne pose de questions. Ce sont des « points à vérifier », jamais des accusations.

**10. Le Copilote RDUE (nouveau)**
*Ce que ça fait :* une bulle d'assistant, en bas à droite du tableau de bord et de la FAQ. Le gérant pose ses questions sur le règlement européen (« C'est pour quand ? », « La Côte d'Ivoire est-elle concernée ? », « Qui dépose la déclaration ? ») et reçoit une réponse en 3 phrases, **avec la source citée** (par exemple : « Benchmarking pays, 22 mai 2025 »). Il propose ensuite des questions de suivi. Si on lui parle de crédit, il répond que ce n'est pas notre métier.
*Ce que ça apporte au client :* le règlement fait peur ; le copilote le rend simple. Le gérant n'a plus besoin d'un juriste pour comprendre ses obligations.

### Sur l'espace exportateur

**11. L'assistant de portefeuille**
*Ce que ça fait :* l'exportateur pose des questions en langage naturel (« montre-moi les parcelles en anomalie à Soubré ») et l'assistant filtre, compte et répond, en citant les parcelles concernées.
*Ce que ça apporte au client :* des milliers de parcelles interrogeables comme on parle à un collègue.

**12. Le mémo de diligence (dossier DDS)**
*Ce que ça fait :* pour chaque parcelle, l'IA rédige le dossier de diligence prêt à joindre à la déclaration européenne (TRACES NT), à partir des seuls faits vérifiés.
*Ce que ça apporte au client :* des heures de rédaction administrative transformées en un clic, dans le format que l'importateur attend.

**13. Le dossier acheteur consolidé (nouveau) + l'argumentaire de prime**
*Ce que ça fait :* un onglet « Dossier acheteur » rassemble toutes les parcelles Conformes en un dossier unique — chiffres consolidés, certificats vérifiables, contours de parcelles joints — avec un **résumé exécutif rédigé par l'IA** pour l'acheteur européen. Et côté coopérative, l'IA rédige **l'argumentaire de négociation** des primes de durabilité.
*Ce que ça apporte au client :* c'est le pilier « Valorisation » : la conformité prouvée devient un argument commercial. La coopérative n'arrive plus les mains vides face à l'acheteur — elle arrive avec un dossier.

---

## 3. Les trois phrases à retenir

1. **« L'IA ne décide jamais, elle explique. »** Les verdicts viennent du satellite et des données ; l'IA les met en mots, en français, en anglais, en dioula, en baoulé.
2. **« La démo ne casse jamais. »** Chaque fonction IA a un filet automatique, et le rituel pré-vol (« Préchauffer l'IA » en admin) confirme « Démo prête : 6/6 en direct » avant de monter sur scène.
3. **« Une seule application, du bureau au bord du champ. »** Le même site fait tout : ordinateur au bureau, téléphone au champ (GPS réel), sans rien installer depuis un store.

*Comptes de démonstration — coopérative : client@test.com / 123client123 · admin : admin@agrivo.com / 123admin123*
