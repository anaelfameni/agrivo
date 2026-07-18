/**
 * Plan d'action de mise en conformité du registre (module PUR, testé).
 *
 * Après l'audit RDUE du registre, ce module transforme les anomalies détectées en un plan de
 * travail priorisé pour le gérant de coopérative. Les FAITS (comptes par catégorie, actions
 * bureau/terrain, % prêt) sont 100 % déterministes ; en mode LIVE, Gemini ne fait que la mise
 * en mots (route /api/gemini/audit-plan). Charte : aucun chiffre inventé, aucune « garantie »,
 * statuts verbatim, aucun vocabulaire de crédit.
 */

import type { ActionAnomalie, AuditRegistre, CategorieAnomalie } from "@/lib/registre/audit";

export interface ResumeAuditCategorie {
  categorie: CategorieAnomalie;
  count: number;
  action: ActionAnomalie;
}

/** Résumé compact d'un audit, transportable vers la route API (aucune donnée nominative). */
export interface ResumeAudit {
  total: number;
  validesCount: number;
  pretPct: number;
  categories: ResumeAuditCategorie[];
}

export interface PlanEtape {
  titre: string;
  detail: string;
}

export interface PlanAction {
  etapes: PlanEtape[];
  conclusion: string;
  /** true si la rédaction vient de Gemini (rempli par la route). */
  live?: boolean;
}

/** Condense un audit en résumé anonyme (comptes par catégorie + action dominante). */
export function resumerAudit(audit: Pick<AuditRegistre, "total" | "valides" | "pretPct" | "anomalies">): ResumeAudit {
  const parCategorie = new Map<CategorieAnomalie, ResumeAuditCategorie>();
  for (const a of audit.anomalies) {
    const entry = parCategorie.get(a.categorie);
    if (entry) entry.count += 1;
    else parCategorie.set(a.categorie, { categorie: a.categorie, count: 1, action: a.action });
  }
  return {
    total: audit.total,
    validesCount: audit.valides.length,
    pretPct: audit.pretPct,
    categories: [...parCategorie.values()],
  };
}

const LIBELLE: Record<CategorieAnomalie, { fr: string; en: string }> = {
  doublon: { fr: "doublons de matricule", en: "duplicate card numbers" },
  "hors-zone": { fr: "coordonnées hors zone", en: "out-of-zone coordinates" },
  "geometrie-invalide": { fr: "géométries invalides (polygones ouverts)", en: "invalid geometries (open polygons)" },
  "polygone-manquant": { fr: "polygones manquants (parcelles de 4 ha et plus)", en: "missing polygons (plots of 4 ha and more)" },
  chevauchement: { fr: "chevauchements entre parcelles", en: "overlaps between plots" },
  "non-carte": { fr: "producteurs non cartés (rapprochement SNT)", en: "farmers without a producer card (NTS reconciliation)" },
};

/** Ordre de traitement recommandé : corrections rapides au bureau d'abord, terrain ensuite. */
const ORDRE: CategorieAnomalie[] = ["doublon", "hors-zone", "non-carte", "geometrie-invalide", "polygone-manquant", "chevauchement"];

/**
 * Plan d'action DÉTERMINISTE (repli sans clé et trame des faits pour Gemini) :
 * bureau d'abord (rapide, sans déplacement), terrain ensuite (étape Cartographie), puis
 * re-audit et vérification satellite des parcelles valides.
 */
export function construirePlanAction(resume: ResumeAudit, lang: "fr" | "en" = "fr"): PlanAction {
  const fr = lang === "fr";
  const etapes: PlanEtape[] = [];
  const tri = [...resume.categories].sort((a, b) => {
    if (a.action !== b.action) return a.action === "bureau" ? -1 : 1;
    return ORDRE.indexOf(a.categorie) - ORDRE.indexOf(b.categorie);
  });

  for (const c of tri) {
    const lib = LIBELLE[c.categorie][lang];
    if (c.action === "bureau") {
      etapes.push({
        titre: fr
          ? `Corriger au bureau : ${c.count} ${lib}`
          : `Fix at the office: ${c.count} ${lib}`,
        detail: fr
          ? "Correction dans le fichier source, sans déplacement : réimportez ensuite le registre pour vérifier."
          : "Fix directly in the source file, no field trip needed: re-import the register afterwards to check.",
      });
    } else {
      etapes.push({
        titre: fr
          ? `Compléter sur le terrain : ${c.count} ${lib}`
          : `Complete in the field: ${c.count} ${lib}`,
        detail: fr
          ? "Capture GPS guidée par l'étape Cartographie (point sous 4 ha, tour de champ à partir de 4 ha), avec les contrôles d'intégrité."
          : "Guided GPS capture via the Mapping step (point under 4 ha, perimeter walk from 4 ha), with the integrity checks.",
      });
    }
  }

  etapes.push({
    titre: fr ? "Réimporter le registre corrigé" : "Re-import the corrected register",
    detail: fr
      ? `Objectif : passer de ${resume.pretPct} % à 100 % de parcelles prêtes pour la RDUE.`
      : `Goal: move from ${resume.pretPct}% to 100% of plots ready for the EUDR.`,
  });
  etapes.push({
    titre: fr
      ? `Lancer la vérification satellite des ${resume.validesCount} parcelles prêtes`
      : `Run the satellite verification of the ${resume.validesCount} ready plots`,
    detail: fr
      ? "Chaque parcelle reçoit un verdict (Conforme, Anomalie détectée ou Données insuffisantes) et alimente le dossier de valorisation."
      : "Each plot receives a verdict (Compliant, Anomaly detected or Insufficient data) and feeds the valorisation file.",
  });

  const conclusion = fr
    ? `${resume.validesCount} parcelle${resume.validesCount > 1 ? "s" : ""} sur ${resume.total} ${resume.validesCount > 1 ? "sont" : "est"} déjà prête${resume.validesCount > 1 ? "s" : ""} : commencez les corrections bureau dès aujourd'hui, planifiez les captures terrain, et le portefeuille devient prouvable parcelle par parcelle.`
    : `${resume.validesCount} plot${resume.validesCount > 1 ? "s" : ""} out of ${resume.total} ${resume.validesCount > 1 ? "are" : "is"} already ready: start the office fixes today, schedule the field captures, and the portfolio becomes provable plot by plot.`;

  return { etapes, conclusion };
}
