"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles, Lock, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth, DEMO_ACCOUNT } from "@/components/auth-provider";

/** Ne suit une redirection que vers un chemin interne (anti open-redirect). */
function safeRedirect(): string {
  if (typeof window === "undefined") return "/app/dashboard";
  const r = new URLSearchParams(window.location.search).get("redirect");
  if (r && r.startsWith("/") && !r.startsWith("//")) return r;
  return "/app/dashboard";
}

export default function ConnexionPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const reduce = useReducedMotion();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) router.replace(safeRedirect());
  }, [loading, user, router]);

  const doLogin = React.useCallback(
    (em: string, pw: string) => {
      setError(null);
      if (!em || !pw) {
        setError("Renseignez votre e-mail et votre mot de passe.");
        return;
      }
      setPending(true);
      // Latence courte : ressenti « vrai SaaS ».
      window.setTimeout(() => {
        const res = login(em, pw);
        if (res.ok) router.replace(safeRedirect());
        else {
          setError(res.error ?? "Connexion impossible.");
          setPending(false);
        }
      }, 450);
    },
    [login, router],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };
  const onDemo = () => {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    doLogin(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
  };

  return (
    <div className="min-h-dvh bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main className="mx-auto flex w-full max-w-md flex-col px-6 pb-24 pt-14 md:pt-20">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-3xl text-forest-950">Connexion</h1>
          <p className="mt-2 text-sm text-stone-500">
            Accédez à votre espace de conformité RDUE.
          </p>

          {/* Encart compte de démonstration */}
          <div className="mt-7 rounded-2xl border border-green-signal/25 bg-green-signal/[0.06] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-forest-950">
              <Sparkles size={16} className="text-green-signal" aria-hidden />
              Compte de démonstration
            </div>
            <p className="num mt-2 text-xs text-stone-600">
              {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
            </p>
            <button
              type="button"
              onClick={onDemo}
              disabled={pending}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-signal px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_-12px_rgba(22,163,74,0.8)] transition-[filter] hover:brightness-110 disabled:opacity-70"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Entrer avec le compte de démonstration
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-stone-400">
            <span className="h-px flex-1 bg-black/[0.08]" />
            ou avec vos identifiants
            <span className="h-px flex-1 bg-black/[0.08]" />
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">E-mail</span>
              <span className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="vous@cooperative.ci"
                  className="w-full rounded-xl border border-black/10 bg-white py-3 pl-10 pr-3.5 text-sm outline-none transition-colors focus:border-green-signal focus:ring-2 focus:ring-green-signal/20"
                />
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">Mot de passe</span>
              <span className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-black/10 bg-white py-3 pl-10 pr-3.5 text-sm outline-none transition-colors focus:border-green-signal focus:ring-2 focus:ring-green-signal/20"
                />
              </span>
            </label>

            {error && (
              <p role="alert" className="rounded-lg bg-red-block/[0.08] px-3 py-2 text-sm text-red-block">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-950 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-70"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : null}
              Se connecter
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-semibold text-forest-950 underline-offset-4 hover:underline">
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
