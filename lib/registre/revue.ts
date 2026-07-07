/**
 * Revue IA du registre — couche de vigilance FINE, complémentaire de l'audit géométrique
 * (audit.ts). Là où l'audit tranche des règles nettes (polygone manquant, hors-zone, doublon
 * de matricule, chevauchement), la revue repère des SIGNAUX FAIBLES qu'un moteur de règles
 * strict laisse passer : superficies étrangement identiques, noms quasi-dupliqués (fautes de
 * saisie), superficies atypiques, matricules consécutifs géographiquement dispersés.
 *
 * Module PUR et déterministe (aucun appel réseau) : c'est la source de vérité. La route
 * /api/gemini/registre-revue ne fait que METTRE EN MOTS ces points ; elle n'en invente aucun.
 *
 * Charte : ce sont des « points à vérifier », JAMAIS des « Anomalie détectée » (statut réservé
 * au verdict satellite). Aucun chiffre inventé : tout est calculé sur les données fournies.
 */

import { haversineM } from "@/lib/geo/terrain";
import type { RegistreParcelle } from "@/lib/registre/audit";

export type GravitePoint = "info" | "attention";

export interface PointRevue {
  id: string;
  motif: { fr: string; en: string };
  /** Matricules concernés (pour surligner dans le registre). */
  parcelles: string[];
  gravite: GravitePoint;
}

export interface RevueRegistre {
  points: PointRevue[];
}

/** Superficie plausible pour une parcelle cacao/café en petite exploitation ivoirienne. */
const HA_MAX_PLAUSIBLE = 50;
/** Deux matricules consécutifs plus éloignés que ce seuil = dispersion à vérifier. */
const DISPERSION_M = 15_000;

/** Centroïde approché [lon, lat] d'une parcelle (point → lui-même ; polygone → moyenne de l'anneau). */
function centroide(p: RegistreParcelle): [number, number] | null {
  if (p.geometrie.type === "point") return p.geometrie.coords;
  if (p.geometrie.type === "polygone") {
    const r = p.geometrie.ring;
    if (r.length === 0) return null;
    const s = r.reduce<[number, number]>((a, [lon, lat]) => [a[0] + lon, a[1] + lat], [0, 0]);
    return [s[0] / r.length, s[1] / r.length];
  }
  return null;
}

function normaliserNom(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Distance d'édition (Levenshtein) entre deux chaînes courtes. */
export function distanceEdition(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let cur = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cout);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

/** Extrait le préfixe et le numéro d'un matricule type "CI-SUB-014" → { prefixe: "CI-SUB-", num: 14 }. */
function decouperMatricule(matricule: string): { prefixe: string; num: number } | null {
  const m = matricule.match(/^(.*?)(\d+)\s*$/);
  if (!m) return null;
  return { prefixe: m[1], num: parseInt(m[2], 10) };
}

/**
 * Revue déterministe : produit la liste ordonnée des points à vérifier. Aucun point si le
 * registre est nickel — la revue ne « trouve » jamais rien pour faire joli.
 */
export function revuerRegistre(parcelles: RegistreParcelle[]): RevueRegistre {
  const points: PointRevue[] = [];

  // 1) Superficies exactement identiques répétées (≥ 3) : signe d'estimation ou de copier-coller.
  const parSuperficie = new Map<number, string[]>();
  for (const p of parcelles) {
    if (typeof p.superficieHa === "number" && p.superficieHa > 0) {
      const cle = Math.round(p.superficieHa * 100) / 100;
      parSuperficie.set(cle, [...(parSuperficie.get(cle) ?? []), p.matricule]);
    }
  }
  for (const [ha, mats] of parSuperficie) {
    if (mats.length >= 3) {
      points.push({
        id: `superficie-identique-${ha}`,
        motif: {
          fr: `${mats.length} parcelles déclarent une superficie strictement identique (${ha} ha). À vérifier : mesure réelle ou valeur estimée reportée à l'identique ?`,
          en: `${mats.length} plots declare a strictly identical area (${ha} ha). To check: real measurement or an estimate copied across?`,
        },
        parcelles: mats,
        gravite: "attention",
      });
    }
  }

  // 2) Noms quasi-dupliqués (distance d'édition 1–2) : probable même producteur ou faute de saisie.
  const nommees = parcelles.filter((p) => p.nom && normaliserNom(p.nom).length >= 5);
  for (let i = 0; i < nommees.length; i++) {
    for (let j = i + 1; j < nommees.length; j++) {
      const a = normaliserNom(nommees[i].nom!);
      const b = normaliserNom(nommees[j].nom!);
      if (a === b) continue; // doublon exact = déjà couvert ailleurs
      const d = distanceEdition(a, b);
      if (d > 0 && d <= 2 && Math.min(a.length, b.length) >= 5) {
        points.push({
          id: `nom-proche-${nommees[i].matricule}-${nommees[j].matricule}`,
          motif: {
            fr: `Deux noms très proches : « ${nommees[i].nom} » et « ${nommees[j].nom} ». À vérifier : même producteur saisi deux fois, ou homonymie réelle ?`,
            en: `Two very close names: "${nommees[i].nom}" and "${nommees[j].nom}". To check: same producer entered twice, or a genuine namesake?`,
          },
          parcelles: [nommees[i].matricule, nommees[j].matricule],
          gravite: "attention",
        });
      }
    }
  }

  // 3) Superficies atypiques (≤ 0 ou > 50 ha) : hors norme d'une petite exploitation.
  const atypiques = parcelles.filter(
    (p) => typeof p.superficieHa === "number" && (p.superficieHa <= 0 || p.superficieHa > HA_MAX_PLAUSIBLE),
  );
  if (atypiques.length > 0) {
    points.push({
      id: "superficie-atypique",
      motif: {
        fr: `${atypiques.length} parcelle(s) présentent une superficie atypique pour une petite exploitation (≤ 0 ou > ${HA_MAX_PLAUSIBLE} ha). À vérifier : unité de saisie ou erreur de mesure ?`,
        en: `${atypiques.length} plot(s) show an atypical area for a smallholding (≤ 0 or > ${HA_MAX_PLAUSIBLE} ha). To check: input unit or measurement error?`,
      },
      parcelles: atypiques.map((p) => p.matricule),
      gravite: "attention",
    });
  }

  // 4) Matricules consécutifs mais géographiquement dispersés : l'enregistrement suit en général
  //    une tournée, donc des numéros voisins pointent d'ordinaire des parcelles voisines.
  const sequables = parcelles
    .map((p) => ({ p, d: decouperMatricule(p.matricule), c: centroide(p) }))
    .filter((x): x is { p: RegistreParcelle; d: { prefixe: string; num: number }; c: [number, number] } => Boolean(x.d && x.c));
  const parPrefixe = new Map<string, typeof sequables>();
  for (const x of sequables) parPrefixe.set(x.d.prefixe, [...(parPrefixe.get(x.d.prefixe) ?? []), x]);
  for (const groupe of parPrefixe.values()) {
    const tri = [...groupe].sort((a, b) => a.d.num - b.d.num);
    for (let i = 1; i < tri.length; i++) {
      if (tri[i].d.num - tri[i - 1].d.num === 1) {
        const dist = haversineM(tri[i - 1].c, tri[i].c);
        if (dist > DISPERSION_M) {
          points.push({
            id: `dispersion-${tri[i - 1].p.matricule}-${tri[i].p.matricule}`,
            motif: {
              fr: `Matricules consécutifs ${tri[i - 1].p.matricule} et ${tri[i].p.matricule} distants de ${Math.round(dist / 1000)} km. À vérifier : parcelles réellement éloignées, ou coordonnées interverties ?`,
              en: `Consecutive IDs ${tri[i - 1].p.matricule} and ${tri[i].p.matricule} are ${Math.round(dist / 1000)} km apart. To check: genuinely distant plots, or swapped coordinates?`,
            },
            parcelles: [tri[i - 1].p.matricule, tri[i].p.matricule],
            gravite: "info",
          });
        }
      }
    }
  }

  // Ordre : les points « attention » d'abord, puis « info ».
  points.sort((a, b) => (a.gravite === b.gravite ? 0 : a.gravite === "attention" ? -1 : 1));
  return { points };
}

/** Résumé compact injecté au prompt live (Gemini reformule, n'ajoute rien). */
export function revuePourPrompt(revue: RevueRegistre, lang: "fr" | "en"): string {
  if (revue.points.length === 0) return lang === "fr" ? "(aucun point à signaler)" : "(nothing to flag)";
  return revue.points.map((pt, i) => `${i + 1}. [${pt.gravite}] ${pt.motif[lang]} (parcelles : ${pt.parcelles.join(", ")})`).join("\n");
}
