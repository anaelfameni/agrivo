"use client";

/**
 * Authentification AGRIVO — session côté client (localStorage), sans backend cette édition.
 * L'expérience (connexion, inscription, session persistante, déconnexion, routes protégées)
 * est identique à un vrai SaaS. En production réelle : auth serveur + mots de passe hachés
 * (voir LIVRABLE_AGRIVO_V4 / recommandations). Ici, stockage local assumé pour la démo.
 *
 * Deux profils clients distincts : COOPÉRATIVE (espace de vérification, /app/dashboard) et
 * EXPORTATEUR (portefeuille multi-coopératives, /app/exportateur). Chacun a son compte de
 * démonstration « 1 clic » et sa propre page d'atterrissage.
 */

import * as React from "react";

export type UserRole = "admin" | "coop" | "exporter";

export interface AppUser {
  email: string;
  nom: string;
  organisation: string;
  role: UserRole;
}

interface StoredUser extends AppUser {
  password: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  role?: UserRole;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => AuthResult;
  signup: (data: { nom: string; email: string; organisation: string; password: string; role: "coop" | "exporter" }) => AuthResult;
  logout: () => void;
}

/** Compte de démonstration COOPÉRATIVE (entrée « 1 clic » pour le jury / les prospects). */
export const COOP_DEMO_ACCOUNT = {
  email: "coop@test.com",
  password: "123TestCoop123",
  nom: "Amadou",
  organisation: "Coopérative Agricole de Soubré",
  role: "coop" as const,
} as const;

/** Compte de démonstration EXPORTATEUR (entrée « 1 clic »). */
export const EXPORT_DEMO_ACCOUNT = {
  email: "export@test.com",
  password: "123TestExport123",
  nom: "Marc",
  organisation: "Cacao Export CI",
  role: "exporter" as const,
} as const;

/** Rétro-compat : ancien nom d'export (certains modules importaient DEMO_ACCOUNT). */
export const DEMO_ACCOUNT = COOP_DEMO_ACCOUNT;

/** Compte administrateur (accès à l'espace /app/admin : clés d'API, MOCK_MODE, état système). */
export const ADMIN_ACCOUNT = {
  email: "admin@agrivo.com",
  password: "123admin123",
  nom: "Administrateur",
  organisation: "Agrivo",
  role: "admin" as const,
} as const;

/** Page d'atterrissage selon le rôle : l'exportateur a son propre tableau de bord. */
export function landingFor(role?: UserRole): string {
  return role === "exporter" ? "/app/exportateur" : "/app/dashboard";
}

const SESSION_KEY = "agrivo:session";
const USERS_KEY = "agrivo:users";

const AuthContext = React.createContext<AuthContextValue | null>(null);

function normaliseRole(r: unknown): UserRole {
  return r === "admin" || r === "exporter" || r === "coop" ? r : "coop";
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const list = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    return list.map((u) => ({ ...u, role: normaliseRole(u.role) }));
  } catch {
    return [];
  }
}
function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* stockage indisponible : on ignore (l'inscription échouera proprement plus haut) */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Hydratation depuis localStorage au montage (état initial déterministe = non connecté,
  // identique SSR/1er rendu client → aucun mismatch d'hydratation).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const u = JSON.parse(raw) as AppUser;
        setUser({ ...u, role: normaliseRole(u.role) });
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persist = React.useCallback((u: AppUser | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const login = React.useCallback<AuthContextValue["login"]>(
    (email, password) => {
      const e = email.trim().toLowerCase();
      if (!e || !password) return { ok: false, error: "Renseignez votre e-mail et votre mot de passe." };
      for (const acc of [ADMIN_ACCOUNT, COOP_DEMO_ACCOUNT, EXPORT_DEMO_ACCOUNT]) {
        if (e === acc.email && password === acc.password) {
          persist({ email: acc.email, nom: acc.nom, organisation: acc.organisation, role: acc.role });
          return { ok: true, role: acc.role };
        }
      }
      const found = readUsers().find((u) => u.email.toLowerCase() === e);
      if (!found) return { ok: false, error: "Aucun compte n'est associé à cet e-mail." };
      if (found.password !== password) return { ok: false, error: "Mot de passe incorrect." };
      persist({ email: found.email, nom: found.nom, organisation: found.organisation, role: found.role });
      return { ok: true, role: found.role };
    },
    [persist],
  );

  const signup = React.useCallback<AuthContextValue["signup"]>(
    (data) => {
      const e = data.email.trim().toLowerCase();
      const reserved: string[] = [COOP_DEMO_ACCOUNT.email, EXPORT_DEMO_ACCOUNT.email, ADMIN_ACCOUNT.email];
      if (reserved.includes(e)) return { ok: false, error: "Cet e-mail est réservé à un compte de démonstration." };
      const role = normaliseRole(data.role);
      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === e))
        return { ok: false, error: "Un compte existe déjà pour cet e-mail." };
      const stored: StoredUser = {
        email: data.email.trim(),
        nom: data.nom.trim(),
        organisation: data.organisation.trim(),
        password: data.password,
        role,
      };
      writeUsers([...users, stored]);
      persist({ email: stored.email, nom: stored.nom, organisation: stored.organisation, role });
      return { ok: true, role };
    },
    [persist],
  );

  const logout = React.useCallback(() => persist(null), [persist]);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>.");
  return ctx;
}
