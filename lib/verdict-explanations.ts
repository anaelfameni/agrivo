/**
 * Explications PRÉCISES des verdicts non concluants — fini le générique.
 *
 * « Données insuffisantes » n'est ni un refus ni une anomalie : c'est un signal de
 * prudence. Les causes listées ici sont les causes RÉELLES documentées par la
 * littérature satellite (FAO/Whisp, Sentinel-2, EUDR) :
 *  - la cacaoyère sous ombrage vue comme de la forêt (le cas n°1 en Côte d'Ivoire :
 *    la canopée d'un système agroforestier ressemble à un couvert forestier),
 *  - les nuages persistants de la saison des pluies (optique aveugle plusieurs mois),
 *  - la parcelle très petite ou au tracé imprécis face à la résolution des capteurs
 *    (pixels Sentinel-2 de 10 m : sous ~0,5 ha, quelques pixels seulement),
 *  - des sources satellites en désaccord (convergence de preuves non atteinte).
 *
 * Module PUR (aucun "use client") : consommé par les composants client ET par les
 * pages serveur (méthodologie), testé unitairement. Charte : aucun % inventé,
 * jamais de « Conforme » par défaut, statuts verbatim.
 */

export interface PointExplication {
  id: string;
  titre: { fr: string; en: string };
  detail: { fr: string; en: string };
}

export const INSUFFISANT_SOUS_TITRE = {
  fr: "Ni un refus, ni une anomalie : un signal de prudence.",
  en: "Neither a rejection nor an anomaly: a signal of caution.",
} as const;

export const INSUFFISANT_DEFINITION = {
  fr: "Les preuves satellites ne permettent pas encore de statuer sur cette parcelle — et Agrivo ne délivre jamais un « Conforme » par défaut. Le verdict deviendra tranchant dès qu'une observation exploitable sera disponible : la parcelle reste dans la file « À re-vérifier », rien n'est perdu.",
  en: "The satellite evidence cannot yet decide on this plot — and Agrivo never issues a default \"Compliant\". The verdict will become decisive as soon as a usable observation is available: the plot stays in the \"To re-verify\" queue, nothing is lost.",
} as const;

/** Les causes réelles documentées d'un verdict « Données insuffisantes ». */
export const INSUFFISANT_CAUSES: PointExplication[] = [
  {
    id: "ombrage",
    titre: { fr: "Cacaoyère sous ombrage vue comme de la forêt", en: "Shade-grown cocoa seen as forest" },
    detail: {
      fr: "Le cas le plus fréquent en Côte d'Ivoire : la canopée d'une plantation agroforestière (cacao sous grands arbres) ressemble, vue du ciel, à un couvert forestier. Le satellite ne peut pas trancher seul entre forêt et culture sous ombrage.",
      en: "The most frequent case in Côte d'Ivoire: the canopy of an agroforestry plantation (cocoa under tall trees) looks, from above, like forest cover. The satellite alone cannot decide between forest and shade-grown crops.",
    },
  },
  {
    id: "nuages",
    titre: { fr: "Nuages persistants de la saison des pluies", en: "Persistent rainy-season clouds" },
    detail: {
      fr: "Les capteurs optiques (Sentinel-2, Landsat) ne voient pas à travers les nuages. Pendant la saison des pluies, une zone peut rester couverte plusieurs mois : aucune image exploitable n'existe alors autour de la date analysée.",
      en: "Optical sensors (Sentinel-2, Landsat) cannot see through clouds. During the rainy season an area can stay covered for months: no usable image exists around the analysed date.",
    },
  },
  {
    id: "petite-parcelle",
    titre: { fr: "Parcelle très petite ou tracé imprécis", en: "Very small plot or imprecise outline" },
    detail: {
      fr: "Un pixel satellite fait environ 10 mètres de côté : une parcelle de moins d'un demi-hectare ne couvre que quelques pixels. Si le tracé GPS est en plus décalé de quelques mètres, l'analyse porte en partie sur le terrain voisin.",
      en: "A satellite pixel is about 10 metres wide: a plot under half a hectare covers only a few pixels. If the GPS outline is also offset by a few metres, the analysis partly covers the neighbouring land.",
    },
  },
  {
    id: "sources-divergentes",
    titre: { fr: "Sources satellites en désaccord", en: "Disagreeing satellite sources" },
    detail: {
      fr: "Agrivo croise plusieurs cartes indépendantes (couvert forestier, alertes de perte, usage des sols). Quand elles se contredisent sur cette zone, la convergence de preuves n'est pas atteinte : la prudence impose de ne pas statuer.",
      en: "Agrivo crosses several independent maps (forest cover, loss alerts, land use). When they contradict each other on this area, convergence of evidence is not reached: caution requires withholding the verdict.",
    },
  },
  {
    id: "saison-seche",
    titre: { fr: "Analyse trop proche d'un passage inexploitable", en: "Analysis too close to an unusable pass" },
    detail: {
      fr: "Le verdict dépend du dernier passage satellite exploitable. Si celui-ci date de plusieurs semaines (brume, angle de prise de vue, qualité de la tuile), la fenêtre d'observation est jugée trop faible pour statuer honnêtement.",
      en: "The verdict depends on the latest usable satellite pass. If it is several weeks old (haze, viewing angle, tile quality), the observation window is judged too weak to decide honestly.",
    },
  },
];

/** La marche à suivre concrète pour la coopérative après « Données insuffisantes ». */
export const INSUFFISANT_ACTIONS: PointExplication[] = [
  {
    id: "saison-seche",
    titre: { fr: "Relancer l'analyse en saison sèche", en: "Re-run the analysis in the dry season" },
    detail: {
      fr: "De novembre à mars, le ciel ivoirien se dégage et les passages satellites redeviennent exploitables. La file « À re-vérifier » du tableau de bord garde la parcelle prête : une relance suffit.",
      en: "From November to March the Ivorian sky clears and satellite passes become usable again. The dashboard's \"To re-verify\" queue keeps the plot ready: one re-run is enough.",
    },
  },
  {
    id: "tracer",
    titre: { fr: "Repréciser le tracé sur le terrain", en: "Refine the outline in the field" },
    detail: {
      fr: "Un tour de champ GPS soigné (sommet par sommet, en suivant le périmètre réel) élimine le doute lié au tracé : l'analyse porte alors exactement sur la parcelle, pas sur la lisière voisine.",
      en: "A careful GPS field walk (vertex by vertex, following the real perimeter) removes outline-related doubt: the analysis then covers exactly the plot, not the neighbouring edge.",
    },
  },
  {
    id: "preuves-terrain",
    titre: { fr: "Documenter l'âge de la plantation", en: "Document the plantation's age" },
    detail: {
      fr: "Des preuves de terrain — photos datées des cacaoyers adultes, attestation de la coopérative, historique d'achat des récoltes — établissent que la plantation existait avant fin 2020, même quand le satellite hésite.",
      en: "Field evidence — dated photos of mature cocoa trees, a cooperative attestation, harvest purchase history — establishes that the plantation predates the end of 2020, even when the satellite hesitates.",
    },
  },
];

/** Les prochaines étapes après « Anomalie détectée ». */
export const ANOMALIE_ACTIONS: PointExplication[] = [
  {
    id: "verifier-trace",
    titre: { fr: "Vérifier d'abord le tracé de la parcelle", en: "First check the plot's outline" },
    detail: {
      fr: "Une erreur de saisie (coordonnées inversées, sommet décalé) suffit à faire recouper une zone déboisée voisine. Corrigez le tracé puis relancez l'analyse avant toute autre décision.",
      en: "A data-entry error (swapped coordinates, offset vertex) is enough to overlap a neighbouring cleared area. Fix the outline then re-run the analysis before any other decision.",
    },
  },
  {
    id: "masque",
    titre: { fr: "Regarder le masque des zones sensibles", en: "Look at the sensitive-areas mask" },
    detail: {
      fr: "Sur la carte, le bouton « Zones sensibles » affiche les aires protégées et forêts classées : vous voyez immédiatement si l'anomalie vient d'un recouvrement, et sur quelle partie de la parcelle.",
      en: "On the map, the \"Sensitive areas\" button shows protected areas and classified forests: you immediately see whether the anomaly comes from an overlap, and on which part of the plot.",
    },
  },
  {
    id: "isoler",
    titre: { fr: "Écarter cette seule parcelle du dossier", en: "Set aside this single plot from the file" },
    detail: {
      fr: "Si l'anomalie se confirme, seule cette parcelle sort du dossier export : le reste du portefeuille n'est pas pénalisé. C'est exactement la ségrégation physique que le règlement exige.",
      en: "If the anomaly is confirmed, only this plot leaves the export file: the rest of the portfolio is not penalised. That is exactly the physical segregation the regulation requires.",
    },
  },
];
