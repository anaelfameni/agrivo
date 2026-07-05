/**
 * Stub GEMINI (Google) — langage / vision / raisonnement.
 *
 * Rôle strict, jamais confondu avec Whisp : Gemini NE détecte PAS la déforestation. Il rend la
 * conformité compréhensible et actionnable : OCR de la carte producteur, explication du verdict
 * en langage naturel, explicabilité du score de sols (XAI). Stubs structurés + mock réaliste.
 *
 * Module serveur : jamais appelé depuis le client (passe par app/api/gemini/*).
 */
import {
  FILIERE_LABEL,
  STATUT_PHRASE,
  fmtHa,
  fmtTonnes,
  volumeValideTonnes,
  type Filiere,
  type Parcelle,
  type Statut,
} from "@/data/mock-parcelles";

/* ----------------------------- Scan carte producteur (Vision) ----------------------------- */

export interface ScanResult {
  producteurNom: string;
  numeroCartePro: string;
  localite: string;
  filiere: Filiere;
}

/** Extraction pré-enregistrée pour la démo (carte de Kouassi Yao, Soubré). */
const DEMO_SCAN: ScanResult = {
  producteurNom: "Kouassi Yao",
  numeroCartePro: "CI-CCC-024517",
  localite: "Soubré, région du Nawa",
  filiere: "cacao",
};

export function scannerCarteProducteurMock(): ScanResult {
  return { ...DEMO_SCAN };
}

/**
 * OCR de la carte producteur via Gemini Vision.
 * // TODO: brancher la vraie clé API Gemini (envoi de l'image en base64, prompt d'extraction).
 */
export async function scannerCarteProducteur(_imageBase64?: string): Promise<ScanResult> {
  return scannerCarteProducteurMock();
}

/* ----------------------------- Explication du verdict ----------------------------- */

/**
 * Rend le verdict compréhensible. Renvoie la PHRASE FIGÉE de la charte (jamais reformulée),
 * que Gemini se contente de restituer telle quelle pour l'affichage et la lecture vocale.
 */
export function genererExplicationVerdict(statut: Statut): string {
  return STATUT_PHRASE[statut];
}

/* ----------------------------- Explicabilité du score de sols (XAI) ----------------------------- */

export interface ScoreSols {
  niveau: "Élevé" | "Moyen" | "À renforcer";
  explication: string;
}

/**
 * Score de résilience des sols — méthodologie inspirée de standards reconnus type Kubeko.
 * Explicabilité (XAI) : le score repose sur des pratiques agronomiques vérifiables, ce qui
 * répond à l'exigence de non-discrimination algorithmique de l'ARTCI.
 * // TODO: brancher la vraie clé API Gemini pour une explication générée dynamiquement.
 */
export function expliquerScoreSols(producteurNom: string): ScoreSols {
  const nom = producteurNom.trim() || "Le producteur";
  return {
    niveau: "Élevé",
    explication: `${nom} recycle ses cabosses par compostage actif : cette pratique enrichit la matière organique du sol et relève son score de résilience. Le score reste explicable et repose sur des pratiques agronomiques vérifiables.`,
  };
}

/* ----------------------------- Assistant portefeuille (raisonnement) ----------------------------- */

export interface PortfolioAnswer {
  /** Réponse en langage naturel, calculée sur les vraies données du portefeuille. */
  texte: string;
  /** Parcelles citées par la réponse (affichées sous forme de puces). */
  parcelles: Parcelle[];
  /** Chiffre clé mis en avant, le cas échéant. */
  metric?: { label: string; value: string };
}

/** Normalise une chaîne : minuscules + suppression des accents (comparaisons robustes). */
function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const REGION_MATCHERS: { label: string; re: RegExp }[] = [
  { label: "Soubré", re: /\bsoubre\b/ },
  { label: "Méagui", re: /\bmeagui\b/ },
  { label: "Gagnoa", re: /\bgagnoa\b/ },
  { label: "Duékoué", re: /\bduekoue\b/ },
  { label: "San Pédro", re: /\bsan[\s-]?pedro\b/ },
  { label: "Daloa", re: /\bdaloa\b/ },
  { label: "Aboisso", re: /\baboisso\b/ },
  { label: "Dabou", re: /\bdabou\b/ },
  { label: "Man", re: /\bman\b/ },
];

const FILIERE_MATCHERS: { filiere: Filiere; re: RegExp }[] = [
  { filiere: "cacao", re: /\bcacao\b/ },
  { filiere: "cafe", re: /\bcafe\b/ },
  { filiere: "hevea", re: /\bhevea\b|caoutchouc/ },
  { filiere: "palmier", re: /\bpalm/ },
];

/** Liste lisible de producteurs, tronquée avec « et N autres ». */
function listNoms(ps: Parcelle[], max = 6): string {
  const noms = ps.slice(0, max).map((p) => p.producteurNom);
  const reste = ps.length - noms.length;
  return noms.join(", ") + (reste > 0 ? `, et ${reste} autre${reste > 1 ? "s" : ""}` : "");
}

/**
 * Interroge le portefeuille en langage naturel. Ce stub RAISONNE réellement sur les données
 * (filtre par région / filière / statut, calcule des agrégats) : il ne renvoie pas un texte figé.
 * // TODO: brancher la vraie clé API Gemini (function-calling sur ces mêmes agrégats) pour une
 * // compréhension plus large ; le raisonnement resterait exécuté sur les données du portefeuille.
 */
export function interrogerPortefeuille(question: string, parcelles: Parcelle[]): PortfolioAnswer {
  const q = norm(question);
  const wants = (...keys: string[]) => keys.some((k) => q.includes(norm(k)));

  // Portée : région, filière, « ce mois-ci »
  const region = REGION_MATCHERS.find((r) => r.re.test(q));
  const filiereM = FILIERE_MATCHERS.find((f) => f.re.test(q));
  let base = parcelles;
  const scopeBits: string[] = [];
  if (region) {
    base = base.filter((p) => norm(p.region).includes(norm(region.label)));
    scopeBits.push(`région de ${region.label}`);
  }
  if (filiereM) {
    base = base.filter((p) => p.filiere === filiereM.filiere);
    scopeBits.push(`filière ${FILIERE_LABEL[filiereM.filiere].toLowerCase()}`);
  }
  if (wants("ce mois", "mois-ci", "ce mois-ci")) {
    const latest = [...parcelles].map((p) => p.dateVerification).sort().at(-1) ?? "";
    const ym = latest.slice(0, 7);
    if (ym) base = base.filter((p) => p.dateVerification.startsWith(ym));
    scopeBits.push("ce mois-ci");
  }
  const scope = scopeBits.length ? ` (${scopeBits.join(", ")})` : "";

  const byStatut = (s: Statut) => base.filter((p) => p.statut === s);
  const anomalies = byStatut("anomalie");
  const conformes = byStatut("conforme");
  const insuffisants = byStatut("insuffisant");

  // Superficie moyenne (d'un statut ciblé)
  if (wants("superficie moyenne", "surface moyenne", "moyenne")) {
    const cibleAnomalie = wants("non conforme", "anomalie", "risque");
    const cibleConforme = wants("conforme");
    const cible = cibleAnomalie ? anomalies : cibleConforme ? conformes : base;
    if (cible.length === 0) return { texte: `Aucune parcelle ne correspond${scope}.`, parcelles: [] };
    const moy = cible.reduce((s, p) => s + p.superficieHa, 0) / cible.length;
    const quoi = cibleAnomalie ? "des parcelles en anomalie" : cibleConforme ? "des parcelles conformes" : "des parcelles";
    return {
      texte: `La superficie moyenne ${quoi}${scope} est de ${fmtHa(moy)}, sur ${cible.length} parcelle${cible.length > 1 ? "s" : ""}.`,
      parcelles: cible,
      metric: { label: `Superficie moyenne ${quoi}`, value: fmtHa(moy) },
    };
  }

  // Anomalies / risque / non conformes
  if (wants("anomalie", "non conforme", "risque", "deforestation", "perte")) {
    if (anomalies.length === 0)
      return {
        texte: `Aucune anomalie détectée${scope}. Les parcelles analysées sont conformes ou en attente de données satellites.`,
        parcelles: [],
        metric: { label: "Parcelles en anomalie", value: "0" },
      };
    const plur = anomalies.length > 1;
    return {
      texte: `${anomalies.length} parcelle${plur ? "s présentent" : " présente"} une anomalie${scope} : ${listNoms(anomalies)}. Une perte de couverture forestière a été identifiée sur ${plur ? "ces zones" : "cette zone"} ; ${plur ? "elles sont" : "elle est"} à écarter des lots destinés à l'UE tant que la situation n'est pas levée.`,
      parcelles: anomalies,
      metric: { label: "Parcelles en anomalie", value: String(anomalies.length) },
    };
  }

  // Données insuffisantes
  if (wants("insuffisant", "nuage", "donnees insuffisantes", "en attente", "nouveau passage")) {
    if (insuffisants.length === 0)
      return { texte: `Aucune parcelle en attente de données${scope} : toutes ont pu être statuées.`, parcelles: [] };
    return {
      texte: `${insuffisants.length} parcelle${insuffisants.length > 1 ? "s sont" : " est"} en « Données insuffisantes »${scope} : ${listNoms(insuffisants)}. Un nouveau passage satellite est requis pour atteindre la convergence de preuves.`,
      parcelles: insuffisants,
      metric: { label: "Parcelles en attente", value: String(insuffisants.length) },
    };
  }

  // Micro-crédit / éligibilité (éligible = parcelle conforme)
  if (wants("credit", "micro-credit", "microcredit", "eligible", "financement", "pret")) {
    const plur = conformes.length > 1;
    return {
      texte: `${conformes.length} producteur${plur ? "s sont éligibles" : " est éligible"} au micro-crédit${scope} : seule une parcelle conforme ouvre droit à un financement (un prêt remboursable de 50 000 à 250 000 FCFA, facilité via l'IMF partenaire). ${listNoms(conformes)}.`,
      parcelles: conformes,
      metric: { label: "Producteurs éligibles au micro-crédit", value: String(conformes.length) },
    };
  }

  // Volume validé
  if (wants("volume", "tonnage", "tonnes")) {
    const v = Math.round(volumeValideTonnes(base));
    return {
      texte: `Le volume validé${scope} (parcelles conformes uniquement) s'élève à ${fmtTonnes(v)}, réparti sur ${conformes.length} parcelle${conformes.length > 1 ? "s" : ""}.`,
      parcelles: conformes,
      metric: { label: "Volume validé", value: fmtTonnes(v) },
    };
  }

  // Conformes
  if (wants("conforme", "certifie", "certifiable", "pretes")) {
    const plur = conformes.length > 1;
    return {
      texte: `${conformes.length} parcelle${plur ? "s sont conformes" : " est conforme"}${scope} : aucune déforestation détectée après le 31 décembre 2020. ${listNoms(conformes)}.`,
      parcelles: conformes,
      metric: { label: "Parcelles conformes", value: String(conformes.length) },
    };
  }

  // Résumé / défaut
  const taux = base.length ? Math.round((conformes.length / base.length) * 100) : 0;
  return {
    texte: `Sur ${base.length} parcelle${base.length > 1 ? "s" : ""}${scope}, ${conformes.length} conforme${conformes.length > 1 ? "s" : ""} (${taux} %), ${anomalies.length} en anomalie et ${insuffisants.length} en attente de données. ${anomalies.length ? `À surveiller en priorité : ${listNoms(anomalies, 4)}.` : "Aucune anomalie à signaler."}`,
    parcelles: anomalies.length ? anomalies : conformes,
    metric: { label: "Taux de conformité", value: `${taux} %` },
  };
}

/** Questions suggérées de l'assistant (cliquables). */
export const QUESTIONS_SUGGEREES = [
  "Quelles parcelles présentent un risque dans la région de Soubré ?",
  "Résume les anomalies détectées ce mois-ci",
  "Quelle est la superficie moyenne des parcelles non conformes ?",
  "Combien de producteurs sont éligibles au micro-crédit ?",
];
