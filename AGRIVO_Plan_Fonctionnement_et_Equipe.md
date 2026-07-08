# AGRIVO — Plan de fonctionnement & équipe (sprint final)

*Mis à jour mercredi 8 juillet 2026 au soir — jury **samedi 11 juillet** · par Anael, chef de projet*
*Produit : **v1.7.1 EN PRODUCTION** · https://agrivo-io.vercel.app · 65 tests · 13 usages IA*

> Ce document remplace la version du 6 juillet (10 pages) : il est volontairement **court**.
> Il dit qui fait quoi, comment on travaille jusqu'à samedi, et ce qui reste à faire. Point final.

---

## 1. L'équipe et les rôles

| Membre | Rôle projet | Livrable d'ici samedi | Au jury |
|---|---|---|---|
| **Anael** | **Chef de projet** · produit, site web, pitch | Site figé ✅ · deck ✅ · revue des écrans mobiles · répétition | Pitch principal + démo web |
| **Christ** | **Application mobile** | Push du code sur Git ✅ (en cours) · **captures d'écran de CHAQUE écran** envoyées à Anael · corrections après revue | Démo mobile (GPS terrain) |
| **Gaddiel** | **Backend & API** | **Gel : on ne touche à rien avant samedi.** Sa proposition d'API REST est juste — elle est déjà en place côté web (routes serveur) ; son évolution se documente pour l'après-jury | Questions techniques |
| **Domy** | **Conformité & données** | Valider **ou retirer** le « 52 % » (Trase) du deck · relecture réglementaire | Questions RDUE / ARTCI |

*Fatim n'est plus dans le projet — elle a été retirée du site (v1.7.1) et des documents.*

---

## 2. Comment on travaille (workflow jusqu'à samedi)

**Le site web est FIGÉ.** v1.7.1 en production, 65 tests au vert, vérification complète passée
(toutes les pages en 200, IA en direct). Plus aucun développement web sauf bug bloquant.

**Le circuit mobile (le seul chantier ouvert) :**
1. Christ pousse son code sur Git et envoie **les captures de tous les écrans** à Anael ;
2. Anael les fait analyser une par une (charte, wording, statuts verbatim, mention DDS, design) ;
3. Christ reçoit une **liste de corrections priorisée** et corrige ;
4. On revalide sur le téléphone de démo (GPS réel + scan carte).

**Les jalons :**
- **Mercredi soir** : gel des fonctionnalités (plus rien de nouveau).
- **Jeudi midi** : dernières captures d'écran mobiles reçues et analysées.
- **Jeudi soir** : gel du code mobile.
- **Vendredi** : **répétition générale chronométrée** (pitch 5 min + démo + questions), rituel
  pré-vol inclus.
- **Samedi** : jury.
- **Point quotidien** : 10 minutes, à heure fixe, mercredi / jeudi / vendredi.

---

## 3. Le message unique (tout le monde dit la même chose)

- Les trois statuts, VERBATIM : **Conforme · Anomalie détectée · Données insuffisantes**.
- Toujours « **évaluation** », jamais « garantie ».
- **Personne ne certifie la RDUE** (aucun organisme agréé n'existe — c'est l'exportateur qui
  déclare et qui est seul responsable). Notre certificat porte désormais la mention exacte :
  *« Il ne remplace pas la déclaration de diligence raisonnée (DDS) de l'exportateur, seul
  responsable de la conformité au sens du règlement (UE) 2023/1115. »* C'est une **force** : nous
  sommes en amont des Bureau Veritas, au niveau du champ, au prix d'une coopérative.
- **Aucun crédit, jamais** : la conformité se valorise par les **primes** et les **acheteurs premium**.
- Prix : **125 000 FCFA/mois** par coopérative (≈ 1 500 FCFA/producteur/an) · API exportateur
  **1 500 000 FCFA/mois**.
- On ne « négocie pas le prix » (fixé par l'État) : on négocie **les primes** au-dessus.

---

## 4. Le jour J (samedi 11 juillet)

- **Avant de monter** : connexion admin → « Préchauffer l'IA (démo) » → attendre
  **« Démo prête : 6/6 en direct »**. Sans ce bandeau, on ne monte pas.
- **Rôles sur scène** : Anael pitche et déroule la démo web ; Christ tient la démo mobile ;
  Gaddiel prend les questions techniques ; Domy les questions réglementaires. **Cold-call
  possible** : chacun connaît les 47 questions/réponses du document Formation.
- **L'effet final** : le jury scanne le QR du certificat avec SON téléphone →
  la page publique de vérification s'affiche.
- **Plan B** : chaque fonction IA a un repli automatique honnête ; vidéo de secours disponible.
- **Comptes démo** : coop `client@test.com / 123client123` · admin `admin@agrivo.com / 123admin123`.

---

## 5. Checklist restante (à cocher au point quotidien)

| # | Action | Qui | Échéance |
|---|---|---|---|
| 1 | Captures de TOUS les écrans mobiles → revue | Christ | Jeudi midi |
| 2 | Corrections mobiles après revue | Christ | Jeudi soir |
| 3 | Activer la **facturation Gemini Tier 1** | Anael | Avant vendredi |
| 4 | Valider ou retirer le « 52 % » (Trase) du deck | Domy | Jeudi |
| 5 | Relecture dioula/baoulé par un locuteur natif (démo : préférer le dioula) | Équipe | Vendredi |
| 6 | Test sur le téléphone de démo : GPS réel + scan carte + diagnostic photo | Anael + Christ | Vendredi |
| 7 | Répétition générale chronométrée + rituel pré-vol | Tous | Vendredi |
| 8 | Lire les 4 PDF équipe (Formation · Nouveautés & IA · Guide mobile · ce plan) | Tous | Jeudi |
| 9 | Après le jury : rotation de la clé Gemini | Anael | Post-jury |

---

*Documents compagnons : AGRIVO_Formation_Equipe.pdf (47 Q/R jury) · AGRIVO_Nouveautes_et_IA.pdf
(les 13 usages IA) · AGRIVO_Guide_App_Mobile.pdf (pour Christ) · AGRIVO_Document_reference_v5.pdf
(référence stratégique).*
