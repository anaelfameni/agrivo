"use client";

/**
 * Authentification AGRIVO — session côté client (localStorage), sans backend cette édition.
 * L'expérience (connexion, inscription, session persistante, déconnexion, routes protégées)
 * est identique à un vrai SaaS. En production réelle : auth serveur + mots de passe hachés
 * (voir LIVRABLE_AGRIVO_V4 / recommandations). Ici, stockage local assumé pour la démo.
 */

import * as React from "react";

export interface AppUser {
  email: string;
  nom: string;
  organisation: string;
}

interface StoredUser extends AppUser {
  password: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => AuthResult;
  signup: (data: { nom: string; email: string; organisation: string; password: string }) => AuthResult;
  logout: () => void;
}

/** Compte de démonstration (entrée « 1 clic » pour le jury / les prospects). */
export const DEMO_ACCOUNT = {
  email: "client@test.com",
  password: "123client123",
  nom: "Amadou",
  organisation: "Coopérative Agricole de Soubré",
} as const;

const SESSION_KEY = "agrivo:session";
const USERS_KEY = "agrivo:users";

const AuthContext = React.createContext<AuthContextValue | null>(null);

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
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
      if (raw) setUser(JSON.parse(raw) as AppUser);
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
      if (e === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
        persist({ email: DEMO_ACCOUNT.email, nom: DEMO_ACCOUNT.nom, organisation: DEMO_ACCOUNT.organisation });
        return { ok: true };
      }
      const found = readUsers().find((u) => u.email.toLowerCase() === e);
      if (!found) return { ok: false, error: "Aucun compte n'est associé à cet e-mail." };
      if (found.password !== password) return { ok: false, error: "Mot de passe incorrect." };
      persist({ email: found.email, nom: found.nom, organisation: found.organisation });
      return { ok: true };
    },
    [persist],
  );

  const signup = React.useCallback<AuthContextValue["signup"]>(
    (data) => {
      const e = data.email.trim().toLowerCase();
      if (e === DEMO_ACCOUNT.email) return { ok: false, error: "Cet e-mail est réservé au compte de démonstration." };
      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === e))
        return { ok: false, error: "Un compte existe déjà pour cet e-mail." };
      const stored: StoredUser = {
        email: data.email.trim(),
        nom: data.nom.trim(),
        organisation: data.organisation.trim(),
        password: data.password,
      };
      writeUsers([...users, stored]);
      persist({ email: stored.email, nom: stored.nom, organisation: stored.organisation });
      return { ok: true };
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
