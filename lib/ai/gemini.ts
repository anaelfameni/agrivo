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
  formatDateFr,
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

/* ----------------------------- Dossier de diligence (DDS) généré par IA ----------------------------- */

export interface MemoSection {
  titre: string;
  corps: string;
}
export interface MemoDiligence {
  reference: string;
  producteur: string;
  statut: Statut;
  genereLe: string;
  sections: MemoSection[];
  conclusion: string;
  avertissement: string;
}

/**
 * Génère un DOSSIER DE DILIGENCE (DDS) « audit-ready » pour une parcelle : la trame et les faits sont
 * DÉTERMINISTES (tirés des vraies données), la rédaction est ce que l'IA générative met en forme. Prêt
 * pour une soumission au Système d'Information RDUE (TRACES NT). Respecte la charte : statuts figés,
 * aucun pourcentage de précision inventé, « évaluation » et non « garantie ».
 * // TODO: brancher Claude (rédaction narrative haut de gamme, voir skill claude-api) — la trame et les
 * // faits ci-dessous resteraient la source de vérité passée en contexte au modèle.
 */
export function genererMemoDiligence(p: Parcelle): MemoDiligence {
  const filiere = FILIERE_LABEL[p.filiere];
  const conforme = p.statut === "conforme";
  const anomalie = p.statut === "anomalie";

  const sections: MemoSection[] = [
    {
      titre: "1. Opérateur et parcelle",
      corps: `Producteur ${p.producteurNom}, carte professionnelle n° ${p.numeroCartePro}, rattaché à la ${p.cooperative} (${p.region}). Filière ${filiere.toLowerCase()}, superficie cartographiée de ${fmtHa(p.superficieHa)}.`,
    },
    {
      titre: "2. Géolocalisation",
      corps: `Le contour de la parcelle est enregistré au format GeoJSON (RFC 7946), à 6 décimales (précision ± 11 cm), conformément aux exigences de géolocalisation du RDUE. La superficie est calculée à partir du polygone vérifié.`,
    },
    {
      titre: "3. Évaluation de déforestation",
      corps: `Verdict de l'outil Whisp (FAO) : « ${STATUT_PHRASE[p.statut]} » La méthode repose sur une convergence de preuves satellite comparées à la date pivot du ${formatDateFr(p.datePivotAnalyse)}. Sources mobilisées : ${p.sourcesDonnees.join(", ")}.`,
    },
    {
      titre: "4. Traçabilité et pièces",
      corps: `Certificat n° ${p.numeroCertificat}, émis le ${formatDateFr(p.dateVerification)}.${p.referenceDDR ? ` Référence de déclaration (DDR) : ${p.referenceDDR}.` : " Référence DDR à générer lors de la soumission TRACES NT."}`,
    },
    {
      titre: "5. Méthodologie et explicabilité",
      corps: `L'évaluation combine l'outil de référence de la FAO pour la détection (Whisp) et une IA générative pour restituer le résultat en langage clair, sans reformuler le verdict. La décision reste explicable et auditable ; elle répond à l'exigence de non-discrimination algorithmique de l'ARTCI.`,
    },
  ];

  const conclusion = conforme
    ? `En l'état des preuves satellite, la parcelle de ${p.producteurNom} est évaluée conforme au RDUE : le dossier est prêt à être joint à une déclaration de diligence raisonnée (DDS) pour TRACES NT.`
    : anomalie
      ? `Une perte de couverture forestière a été identifiée : le lot rattaché à cette parcelle doit être écarté des expéditions vers l'Union européenne tant que l'anomalie n'est pas levée et documentée.`
      : `Les données satellites sont insuffisantes pour statuer : un nouveau passage est requis avant toute soumission. Aucun certificat définitif n'est émis à ce stade.`;

  return {
    reference: `DDS-${p.numeroCertificat}`,
    producteur: p.producteurNom,
    statut: p.statut,
    genereLe: new Date().toISOString(),
    sections,
    conclusion,
    avertissement:
      "Ce dossier constitue une évaluation de conformité, non une garantie. Généré en mode démonstration (données pré-enregistrées) ; en production, la rédaction s'appuie sur les mêmes faits vérifiés.",
  };
}

/* ----------------------------- Copilote agentique v2 (tool-use transparent) ----------------------------- */

/** Un outil « appelé » par l'agent pour construire sa réponse (rendu transparent dans l'UI). */
export interface AgentTool {
  name: string;
  detail: string;
}
export interface AgentAnswer extends PortfolioAnswer {
  tools: AgentTool[];
}

/**
 * Copilote agentique : au lieu d'un texte figé, il expose la TRACE des outils réellement exécutés sur
 * les données du portefeuille (filtres, agrégats). En MOCK, le raisonnement est déterministe
 * (`interrogerPortefeuille`) ; la structure est prête pour du **function-calling** LLM réel.
 * // TODO: brancher Claude (tool use / function calling — voir skill claude-api) : les mêmes fonctions
 * // deviennent des `tools`, le modèle décide lesquelles appeler ; l'exécution reste sur PARCELLES.
 */
export function runPortfolioAgent(question: string, parcelles: Parcelle[]): AgentAnswer {
  const answer = interrogerPortefeuille(question, parcelles);
  const q = norm(question);
  const tools: AgentTool[] = [{ name: "scanPortefeuille", detail: `${parcelles.length} parcelles` }];

  const region = REGION_MATCHERS.find((r) => r.re.test(q));
  if (region) {
    const n = parcelles.filter((p) => norm(p.region).includes(norm(region.label))).length;
    tools.push({ name: "filtreRégion", detail: `${region.label} · ${n}` });
  }
  const fil = FILIERE_MATCHERS.find((f) => f.re.test(q));
  if (fil) {
    const n = parcelles.filter((p) => p.filiere === fil.filiere).length;
    tools.push({ name: "filtreFilière", detail: `${FILIERE_LABEL[fil.filiere]} · ${n}` });
  }
  if (answer.metric) tools.push({ name: "agrégation", detail: `${answer.metric.label} = ${answer.metric.value}` });
  else tools.push({ name: "synthèse", detail: `${answer.parcelles.length} parcelles citées` });

  return { ...answer, tools };
}

/* ----------------------------- Analyse de risque RDUE expliquée (XAI) ----------------------------- */

export type RiskLevel = "Faible" | "Modéré" | "Élevé" | "Bloquant";
export interface RiskFactor {
  label: string;
  sens: "positif" | "négatif" | "neutre";
}
export interface RiskAssessment {
  niveau: RiskLevel;
  synthese: string;
  facteurs: RiskFactor[];
  recommandation: string;
}

/**
 * Analyse de risque RDUE d'une parcelle, EXPLIQUÉE (aide à la décision, jamais automatisation).
 * Niveau qualitatif (jamais un pourcentage inventé) + facteurs pondérés lisibles + recommandation.
 * // TODO: enrichissement LLM possible (narration), mais le niveau et les facteurs restent déterministes.
 */
export function analyserRisque(p: Parcelle): RiskAssessment {
  const filiere = FILIERE_LABEL[p.filiere].toLowerCase();
  if (p.statut === "anomalie") {
    return {
      niveau: "Bloquant",
      synthese: `Risque RDUE bloquant sur la parcelle de ${p.producteurNom} : une perte de couverture forestière a été identifiée.`,
      facteurs: [
        { label: "Perte de couverture détectée après le 31 décembre 2020", sens: "négatif" },
        { label: "Anomalie corroborée par une seconde source satellite", sens: "négatif" },
        { label: `Filière ${filiere} exposée au marché européen`, sens: "négatif" },
      ],
      recommandation:
        "Écarter le lot des expéditions vers l'Union européenne. Documenter l'anomalie et engager une remédiation avant toute nouvelle soumission.",
    };
  }
  if (p.statut === "insuffisant") {
    return {
      niveau: "Modéré",
      synthese: `Risque modéré sur la parcelle de ${p.producteurNom} : les données satellites sont insuffisantes pour statuer.`,
      facteurs: [
        { label: "Couverture nuageuse persistante sur les passages disponibles", sens: "neutre" },
        { label: "Aucune perte de couverture confirmée à ce stade", sens: "positif" },
        { label: "Verdict définitif en attente de convergence de preuves", sens: "négatif" },
      ],
      recommandation:
        "Programmer un nouveau passage satellite. Ne pas inclure la parcelle dans un lot destiné à l'UE tant que le verdict n'est pas rendu.",
    };
  }
  return {
    niveau: "Faible",
    synthese: `Risque RDUE faible sur la parcelle de ${p.producteurNom} : aucune déforestation détectée après le 31 décembre 2020.`,
    facteurs: [
      { label: "Verdict Whisp conforme, convergence des sources satellites", sens: "positif" },
      { label: "Dossier de diligence mobilisable pour TRACES NT", sens: "positif" },
      {
        label: p.propositionCredit
          ? "Parcelle éligible au micro-crédit (inclusion financière)"
          : "Éligible au micro-crédit sous réserve d'une proposition",
        sens: "positif",
      },
    ],
    recommandation:
      "Lot éligible à l'expédition UE. Joindre le dossier de diligence (DDS) et conserver la référence du certificat.",
  };
}

/* ----------------------------- Scoring de crédit explicable (inclusion, XAI) ----------------------------- */

export type CreditClasse = "A" | "B" | "C" | "Non éligible";
export interface CreditSignal {
  label: string;
  sens: "positif" | "négatif" | "neutre";
}
export interface CreditScore {
  eligible: boolean;
  classe: CreditClasse;
  plafondFcfa: number;
  signaux: CreditSignal[];
  explication: string;
}

/**
 * Score de crédit ALTERNATIF et EXPLICABLE pour l'inclusion financière (aide à la décision, jamais
 * automatisation : la validation du prêt reste humaine). Signaux : conformité RDUE, résilience des
 * sols, capacité de production, historique. Plafond RECOMMANDÉ borné à la fourchette de la charte
 * (50 000–250 000 FCFA) ; le micro-crédit reste un PRÊT REMBOURSABLE, jamais « gratuit ».
 * // TODO: enrichir avec des signaux Mobile Money réels (historique de transactions) une fois branché.
 */
export function scorerCreditProducteur(p: Parcelle): CreditScore {
  if (p.statut !== "conforme") {
    return {
      eligible: false,
      classe: "Non éligible",
      plafondFcfa: 0,
      signaux: [
        {
          label:
            p.statut === "anomalie"
              ? "Parcelle en anomalie : accès au marché UE bloqué"
              : "Verdict en attente : conformité non établie",
          sens: "négatif",
        },
        { label: "Seule une parcelle conforme ouvre droit au préfinancement", sens: "neutre" },
      ],
      explication:
        "Le micro-crédit est conditionné à la conformité RDUE : il n'est pas proposé tant que la parcelle n'est pas conforme. Aide à la décision — la validation reste humaine.",
    };
  }

  const brut = 50_000 + Math.round(p.superficieHa * 42_000);
  const plafond = Math.max(50_000, Math.min(250_000, Math.round(brut / 10_000) * 10_000));
  const classe: CreditClasse = plafond >= 200_000 ? "A" : plafond >= 120_000 ? "B" : "C";

  return {
    eligible: true,
    classe,
    plafondFcfa: plafond,
    signaux: [
      { label: "Parcelle conforme RDUE : accès au marché UE sécurisé", sens: "positif" },
      { label: "Score de résilience des sols élevé (compostage vérifié)", sens: "positif" },
      { label: `Superficie de ${fmtHa(p.superficieHa)} : capacité de production établie`, sens: "positif" },
      { label: "Historique de vérification enregistré (traçabilité)", sens: "positif" },
    ],
    explication:
      "Score explicable, sans bureau de crédit : il combine conformité, santé des sols et capacité de production. Le micro-crédit reste un prêt remboursable (50 000–250 000 FCFA), facilité via l'IMF partenaire ; la décision finale revient au gérant.",
  };
}

/* ----------------------------- Résumé de changement satellite (narration IA) ----------------------------- */

export interface ChangementSatellite {
  narratif: string;
  observations: { periode: string; note: string; sens: "positif" | "négatif" | "neutre" }[];
}

/**
 * Narration en langage clair de l'évolution du couvert forestier depuis la date pivot (31/12/2020),
 * à partir du faisceau de preuves Whisp. L'IA générative MET EN MOTS ; elle ne produit pas le verdict
 * et n'invente aucun pourcentage.
 */
export function resumerChangementSatellite(p: Parcelle): ChangementSatellite {
  const pivot = "31 décembre 2020";
  if (p.statut === "anomalie") {
    return {
      narratif: `Depuis la date pivot du ${pivot}, l'imagerie satellite montre une réduction du couvert forestier sur la parcelle de ${p.producteurNom}. La perte est corroborée par une seconde source indépendante : la parcelle ne peut être considérée conforme en l'état.`,
      observations: [
        { periode: "31 déc. 2020 (pivot)", note: "Couvert forestier de référence établi", sens: "neutre" },
        { periode: "Après 2020", note: "Réduction du couvert détectée (Sentinel-2)", sens: "négatif" },
        { periode: "Corroboration", note: "Perte confirmée par une seconde source", sens: "négatif" },
      ],
    };
  }
  if (p.statut === "insuffisant") {
    return {
      narratif: `Sur la parcelle de ${p.producteurNom}, les passages satellite disponibles depuis le ${pivot} sont trop souvent masqués par les nuages. La convergence de preuves n'est pas atteinte : un nouveau passage est nécessaire avant de statuer.`,
      observations: [
        { periode: "31 déc. 2020 (pivot)", note: "Couvert de référence établi", sens: "neutre" },
        { periode: "Passages récents", note: "Couverture nuageuse persistante", sens: "neutre" },
        { periode: "Statut", note: "Convergence de preuves non atteinte", sens: "négatif" },
      ],
    };
  }
  return {
    narratif: `Depuis la date pivot du ${pivot}, le couvert forestier de la parcelle de ${p.producteurNom} est resté stable : aucune alerte de perte n'a été relevée et les sources satellites convergent. La parcelle est évaluée conforme.`,
    observations: [
      { periode: "31 déc. 2020 (pivot)", note: "Couvert forestier de référence établi", sens: "neutre" },
      { periode: "2021 – aujourd'hui", note: "Couvert stable, aucune alerte de perte", sens: "positif" },
      { periode: "Dernier passage", note: "Conformité confirmée par convergence", sens: "positif" },
    ],
  };
}
