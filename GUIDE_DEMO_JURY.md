# GUIDE DE DÉMO — Vibeathon, 11 juillet 2026

> Anti-sèche intégrée à l'app : **Ctrl+Shift+D** sur n'importe quelle page ouvre le guide présentateur.
> La démo du parcours producteur se fait sur **l'app mobile de Christ** ; la plateforme web sert la
> partie coopérative/exportateur et la vérification publique.

## Comptes
- Coopérative (Amadou) : `client@test.com` / `123client123` — bouton « Entrer avec le compte de démonstration ».
- Admin : `admin@agrivo.com` / `123admin123` (clés d'API, MOCK_MODE, état des services).

## Déroulé recommandé (7 minutes)
1. **Splash + landing (30 s)** — la promesse : « De la parcelle vérifiée au crédit du producteur. »
2. **Mobile (Christ) : golden path (3 min)** — consentement ARTCI → scan carte (Gemini Vision) →
   polygone → verdict Whisp → certificat PDF → micro-crédit Mobile Money.
3. **Web : dashboard coopérative (1 min)** — 4 KPI officiels, alertes, dernière vérification remontée.
4. **Web : dashboard exportateur (1,5 min)** — carte du portefeuille, export GeoJSON TRACES NT,
   copilote IA (question : « Quelles parcelles présentent un risque dans la région de Soubré ? »).
5. **Effet final (1 min)** — le jury **scanne le QR du certificat PDF** avec son propre téléphone →
   `/verifier-certificat` confirme le statut. « N'importe quel acheteur peut vérifier nos certificats. »

## Phrases clés
- « Nous combinons l'outil de référence de la FAO pour la détection (Whisp) et une IA générative
  pour rendre la conformité compréhensible et actionnable par tous. »
- « C'est une évaluation, pas une garantie : l'opérateur reste responsable de sa déclaration. »
- « Le micro-crédit est un prêt remboursable de 50 000 à 250 000 FCFA facilité via l'IMF partenaire ;
  le service Agrivo, lui, est gratuit pour le producteur. »

## Réponses aux questions pièges
- **« Votre IA est-elle réelle ? »** — Oui : quand `GEMINI_API_KEY` est posée, l'OCR, le mémo DDS et le
  copilote appellent réellement Gemini. Les verdicts et chiffres restent calculés sur les données
  (l'IA met en mots, elle n'invente rien). Sans clé ou en cas de panne réseau : repli automatique sur
  le mode démonstration, visible et assumé dans l'admin.
- **« Précision de Whisp ? »** — Nous ne citons aucun pourcentage : Whisp est l'outil ONU/FAO de
  référence, pilote Kenya 6 000+ parcelles ; méthode par convergence de preuves.
- **« Et la BCEAO ? »** — Sous-traitant technologique B2B SaaS : aucun agrément financier requis,
  le crédit est porté par l'IMF partenaire.

## PLAN B — script de la vidéo de secours (à tourner AVANT le 11 juillet)
Format : capture d'écran 1080p, 2 min 30, sans musique forte, voix off ou sous-titres.

| # | Durée | Plan | Voix off |
|---|-------|------|----------|
| 1 | 0:00–0:15 | Splash → landing, scroll lent jusqu'aux 7 filières | « Agrivo rend la conformité RDUE simple, prouvable et abordable. » |
| 2 | 0:15–0:45 | Mobile : consentement → scan de la carte de Kouassi | « Au bord du champ, Amadou scanne la carte du producteur : Gemini Vision pré-remplit tout. » |
| 3 | 0:45–1:20 | Analyse : polygone qui se dessine → verdict Conforme | « Whisp, l'outil de la FAO, compare la parcelle aux images satellite depuis décembre 2020. » |
| 4 | 1:20–1:45 | Certificat PDF + zoom sur le QR → scan → /verifier-certificat | « Chaque certificat est vérifiable publiquement par n'importe quel acheteur. » |
| 5 | 1:45–2:10 | Slider micro-crédit → simulation Mobile Money | « Et la conformité devient une opportunité : un prêt de 50 à 250 mille FCFA, via l'IMF partenaire. » |
| 6 | 2:10–2:30 | Dashboard exportateur : carte + copilote + export TRACES NT | « Côté exportateur : tout le portefeuille, prêt pour TRACES NT. Agrivo. Prêt à exporter. » |

Checklist tournage : mode avion OFF mais MOCK garanti · reduced-motion OFF · fenêtre 1440×900 ·
compte démo déjà connecté · vider la recherche du dashboard · préparer la question du copilote.
