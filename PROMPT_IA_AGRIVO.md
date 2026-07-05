# PROMPT — Analyser, améliorer et étendre l'IA d'AGRIVO (travail de recherche)

> À exécuter depuis `.claude/projects/Agrivo`. Objectif : faire d'AGRIVO le produit agri-conformité
> **le plus intelligent** de sa catégorie, sans jamais trahir la charte (pas de % inventé, statuts figés,
> honnête sur ce que le produit fait aujourd'hui vs demain). Garde-fou de fin : `tsc` + `next build` verts.

## 1. Contexte produit
AGRIVO = SaaS de conformité **RDUE** (déforestation) + **santé des sols** + **inclusion financière** pour
les filières agricoles ivoiriennes. Deux IA distinctes, jamais confondues :
- **Whisp (FAO)** = détection satellite de déforestation (le VERDICT). Outil de référence, pas un modèle maison.
- **IA générative** = rend la conformité compréhensible et actionnable (l'ACTION) : OCR carte, explication,
  copilote portefeuille, rapports.

## 2. État actuel de l'IA (à auditer précisément)
`lib/ai/` (tout en `MOCK_MODE` forcé, aucune clé) :
- `whisp.ts` — verdict + phrase figée + « convergence de preuves » qualitative (jamais de %).
- `gemini.ts` — `scannerCarteProducteur` (OCR, retour fixe), `genererExplicationVerdict` (phrase figée),
  `expliquerScoreSols` (XAI, texte fixe), `interrogerPortefeuille` (**raisonneur déterministe par
  mots-clés** sur les vraies données — pas un vrai LLM).
- Routes : `app/api/{whisp/verify, gemini/scan, gemini/explain, gemini/query}`.
- **Faiblesses** : aucune vraie inférence LLM ; copilote limité à des motifs ; pas de génération de
  rapport ; pas de streaming ; pas de function-calling ; pas de détection de changement expliquée.

## 3. Recherche — état de l'art (juillet 2026) à intégrer
Les plateformes RDUE leaders (osapiens, Source Intelligence, TraceX, IntegrityNext…) convergent sur :
1. **Analyse de risque automatisée** (fournisseur + géolocalisation) avec alertes IA.
2. **Détection de changement** satellite en temps quasi réel, expliquée.
3. **Rapport « audit-ready » / génération de la DDS** prête à soumettre au Système d'Information UE (API).
4. **Assistant agentique** qui raisonne sur des objectifs multi-étapes et agit sur les données.
5. Côté finance smallholder (Apollo Agriculture, IFPRI) : **scoring de crédit alternatif** (historique
   Mobile Money + données agricoles), explicable, sans bureau de crédit.
> Choix « meilleur modèle » : **Gemini** pour la Vision (OCR carte) ; **Claude (famille Claude 5 /
> Opus 4.8)** pour le RAISONNEMENT, la génération de rapport et le copilote (qualité + tool-use). Whisp
> reste la détection. ⚠️ Avant de câbler Claude : lire la skill `claude-api` (IDs de modèles, tool use,
> streaming, caching) — ne jamais inventer un ID de modèle.

## 4. Fonctionnalités IA à livrer (priorisées)
**P1 — Impact jury + produit immédiat**
1. **Générateur de dossier de diligence (DDS) par IA** — synthèse audit-ready d'une parcelle/portefeuille
   (opérateur, géoloc 6 décimales, verdict, faisceau de preuves, méthodologie, date pivot, conclusion),
   prête pour TRACES NT. *Structure déterministe + rédaction LLM ; MOCK-safe.*
2. **Copilote agentique v2** — vrai LLM avec **function-calling** sur les agrégats du portefeuille
   (`portfolioStats`, filtres région/filière/statut, éligibilité crédit, volume), **réponses en
   streaming**, citations de parcelles cliquables. Repli MOCK = le raisonneur actuel.
3. **Analyse de risque expliquée** par producteur/lot : score de risque RDUE (faisceau de preuves
   qualitatif, JAMAIS un % inventé) + recommandation d'action.

**P2 — Différenciateurs**
4. **Score de crédit alternatif explicable** (inclusion) : signaux Mobile Money + agronomie + conformité,
   sortie explicable (XAI), aligné « aide à la décision, jamais automatisation ».
5. **Résumé de changement satellite** : narration de l'évolution de couverture depuis 2020 (à partir de
   Whisp), en langage clair.
6. **Assistant vocal multilingue** (FR/EN écrit ; **Dioula/Baoulé à la voix** pour le producteur) —
   Web Speech + TTS ; l'IA vocale est le SEUL vecteur dioula/baoulé.

## 5. Contraintes techniques
- Next.js 16 (App Router, RSC), React 19, TS strict, Tailwind v4, framer-motion 12.
- **Frontière RSC** : aucune valeur non-composant exportée depuis un fichier `"use client"` consommé par
  un composant serveur. IA = **modules serveur**, appelés via `app/api/*` (jamais depuis le client).
- **MOCK_MODE** : chaque feature doit fonctionner sans clé (latence simulée, données pré-enregistrées) ET
  exposer un point d'intégration clair (`// TODO: clé réelle`). La démo ne dépend d'aucun service externe.
- **Providers** : clé via env serveur (le compte `/app/admin` les affiche masquées). Gemini = Vision ;
  Claude = raisonnement/rapport (lire skill `claude-api`).

## 6. Garde-fous de contenu (charte — non négociables)
- Statuts FIGÉS : « Conforme » / « Anomalie détectée » / « Données insuffisantes ».
- **Jamais** de pourcentage de précision inventé. **Jamais** « garantie » (dire « évaluation »).
- Whisp ≠ Gemini ≠ Claude dans le discours. Micro-crédit = prêt remboursable (jamais « gratuit »).
- Honnêteté : distinguer ce qui tourne en mock de ce qui nécessite une clé réelle.

## 7. Livrables & GATE
- Code des features P1 (lib + routes + UI) avec repli MOCK.
- `tsc --noEmit` ✓, `next build` ✓, parcours démo vérifié.
- Mise à jour `CLAUDE.md` (journal) + note honnête « mock vs prod ».
```
