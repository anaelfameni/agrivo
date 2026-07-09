/**
 * Évaluation d'une parcelle À PARTIR DE SES SOMMETS (module PUR, réutilisable client + serveur).
 *
 * Croisement géométrique avec les aires protégées (data/zones-sensibles) :
 *  - < 4 sommets ou superficie non calculable → « Données insuffisantes » ;
 *  - recouvre une aire protégée → « Anomalie détectée » (zone exclue au sens du RDUE) ;
 *  - sinon → « Conforme » (hors aire protégée).
 * C'est une évaluation par croisement de couches, jamais une garantie.
 */
import { ZONES_SENSIBLES } from "@/data/zones-sensibles";
import { aireHa, polygonesSeChevauchent } from "@/lib/geo/terrain";
import { STATUT_PHRASE, STATUT_PHRASE_EN, type Statut } from "@/data/mock-parcelles";

export interface EvaluationParcelle {
  statut: Statut;
  phrase: string; // explication FR (affichée comme verdict)
  phraseEn: string;
  motif: string; // raison courte du croisement (affichée à l'étape cartographie)
  motifEn: string;
}

const AIRE_MIN_HA = 0.1;

export function evaluerParcelle(coords: number[][]): EvaluationParcelle {
  const valides = coords.filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));

  if (valides.length < 4 || aireHa(valides) < AIRE_MIN_HA) {
    return {
      statut: "insuffisant",
      phrase: STATUT_PHRASE.insuffisant,
      phraseEn: STATUT_PHRASE_EN.insuffisant,
      motif: "Polygone incomplet ou superficie non calculable.",
      motifEn: "Incomplete polygon or non-computable area.",
    };
  }

  const zone = ZONES_SENSIBLES.find((z) => polygonesSeChevauchent(valides, z.ring));
  if (zone) {
    return {
      statut: "anomalie",
      phrase: `La parcelle recouvre l'aire protégée « ${zone.nom} » : zone exclue au sens du règlement (UE) 2023/1115.`,
      phraseEn: `The plot overlaps the protected area "${zone.nom}": a zone excluded under Regulation (EU) 2023/1115.`,
      motif: `Recouvre l'aire protégée « ${zone.nom} ».`,
      motifEn: `Overlaps the protected area "${zone.nom}".`,
    };
  }

  return {
    statut: "conforme",
    phrase: STATUT_PHRASE.conforme,
    phraseEn: STATUT_PHRASE_EN.conforme,
    motif: "Hors de toute aire protégée ; superficie et géométrie valides.",
    motifEn: "Outside any protected area; valid area and geometry.",
  };
}
