/**
 * Guide interactif — clés de persistance partagées entre le guide (components/app/onboarding-tour)
 * et l'authentification (components/auth-provider).
 *
 * Le drapeau « visite vue » est posé à la fermeture du guide et bloque son ouverture automatique.
 * À chaque CONNEXION d'un compte de démonstration, l'authentification efface ces drapeaux : la
 * visite guidée se rejoue donc à toutes les connexions démo, sans se rouvrir à chaque retour au
 * tableau de bord pendant une même session.
 */

export const TOUR_KEY_COOP = "agrivo:tour:v2:coop";
export const TOUR_KEY_EXPORTER = "agrivo:tour:v2:exporter";

/** Clé du drapeau « visite vue » pour un rôle donné (rôle inconnu → parcours coopérative). */
export function tourKey(role: string): string {
  return role === "exporter" ? TOUR_KEY_EXPORTER : TOUR_KEY_COOP;
}

/** Efface les drapeaux : la prochaine arrivée sur l'accueil de l'espace rejouera la visite. */
export function reinitialiserTour(): void {
  try {
    localStorage.removeItem(TOUR_KEY_COOP);
    localStorage.removeItem(TOUR_KEY_EXPORTER);
  } catch {
    /* stockage indisponible : tant pis, le guide restera en mode « une fois » */
  }
}
