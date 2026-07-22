/**
 * Demandes de cotation (RFQ) — la brique « premium » qui relie l'acheteur à l'exportateur.
 *
 * L'acheteur demande une cotation depuis la fiche publique d'un lot (volume souhaité, incoterm,
 * message) ; l'exportateur la retrouve dans « Mes lots » et y répond en direct (email/téléphone).
 * AGRIVO met en relation, JAMAIS de paiement ni de crédit sur la plateforme (frontière Nanti).
 *
 * Démo : persistance localStorage (même navigateur), comme la prospection et l'acceptation
 * opérateur. Module PUR + helpers storage gardés (typeof window) : importable par les tests.
 */

export type StatutDemande = "nouvelle" | "repondue";

export interface DemandeCotation {
  id: string;
  refLot: string;
  nomLot: string;
  societe: string;
  contact: string; // email ou téléphone, au choix de l'acheteur
  pays: string;
  volumeT: number; // volume souhaité en tonnes
  incoterm: string; // FOB Abidjan par défaut ; texte libre contrôlé par la liste INCOTERMS
  message: string;
  dateIso: string;
  statut: StatutDemande;
}

/** Incoterms proposés dans le formulaire (liste fermée, pas de texte inventé). */
export const INCOTERMS = ["FOB Abidjan", "FOB San Pedro", "CIF port UE", "À discuter"] as const;

export interface ErreursDemande {
  societe?: string;
  contact?: string;
  volumeT?: string;
}

/** Un contact valide = email plausible OU numéro de téléphone (8+ chiffres). */
export function contactValide(contact: string): boolean {
  const c = (contact ?? "").trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return true;
  const digits = c.replace(/[^\d]/g, "");
  return digits.length >= 8;
}

/**
 * Valide une demande avant enregistrement. Retourne un objet d'erreurs par champ
 * (vide = demande valide). `tonnageLot` borne le volume demandable (0 < v <= tonnage du lot).
 */
export function validerDemande(
  input: { societe: string; contact: string; volumeT: number },
  tonnageLot: number,
  lang: "fr" | "en" = "fr",
): ErreursDemande {
  const fr = lang === "fr";
  const e: ErreursDemande = {};
  if (!(input.societe ?? "").trim()) e.societe = fr ? "Nom de la société requis." : "Company name required.";
  if (!contactValide(input.contact)) e.contact = fr ? "Email ou téléphone valide requis." : "Valid email or phone required.";
  const v = Number(input.volumeT);
  if (!Number.isFinite(v) || v <= 0) e.volumeT = fr ? "Volume souhaité requis (en tonnes)." : "Requested volume required (tonnes).";
  else if (v > tonnageLot) e.volumeT = fr
    ? `Le lot fait ${tonnageLot.toFixed(1)} t : demandez au plus ce tonnage.`
    : `The lot is ${tonnageLot.toFixed(1)} t: request at most that tonnage.`;
  return e;
}

/** Construit une demande complète prête à être enregistrée (id + date déterministes injectables). */
export function construireDemande(
  input: Omit<DemandeCotation, "id" | "dateIso" | "statut">,
  now: Date = new Date(),
): DemandeCotation {
  return {
    ...input,
    societe: input.societe.trim(),
    contact: input.contact.trim(),
    pays: (input.pays ?? "").trim() || "À confirmer",
    message: (input.message ?? "").trim(),
    id: `RFQ-${now.getTime().toString(36).toUpperCase()}`,
    dateIso: now.toISOString(),
    statut: "nouvelle",
  };
}

/** Compteurs pour l'en-tête de la boîte de réception exportateur. */
export function resumeDemandes(demandes: DemandeCotation[]): {
  total: number;
  nouvelles: number;
  volumeTotalT: number;
} {
  return {
    total: demandes.length,
    nouvelles: demandes.filter((d) => d.statut === "nouvelle").length,
    volumeTotalT: demandes.reduce((s, d) => s + (Number.isFinite(d.volumeT) ? d.volumeT : 0), 0),
  };
}

/** Marque une demande répondue (immuable : retourne un nouveau tableau). */
export function marquerRepondue(demandes: DemandeCotation[], id: string): DemandeCotation[] {
  return demandes.map((d) => (d.id === id ? { ...d, statut: "repondue" as const } : d));
}

/* ---------------------------------- persistance (démo) ---------------------------------- */

const CLE_STOCKAGE = "agrivo:rfq:v1";

export function lireDemandes(): DemandeCotation[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE);
    const arr = brut ? (JSON.parse(brut) as DemandeCotation[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function ecrireDemandes(demandes: DemandeCotation[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(demandes));
  } catch {
    /* stockage plein ou bloqué : la démo continue sans persister */
  }
}

export function ajouterDemande(demande: DemandeCotation): DemandeCotation[] {
  const suivantes = [demande, ...lireDemandes()];
  ecrireDemandes(suivantes);
  return suivantes;
}
