"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Sparkles, Lock, Mail, Building2, Globe } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth, COOP_DEMO_ACCOUNT, EXPORT_DEMO_ACCOUNT, landingFor } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";

const COPY = {
  fr: {
    title: "Connexion",
    subtitle: "Accédez à votre espace de conformité RDUE.",
    demoTitle: "Comptes de démonstration",
    demoHint: "Choisissez le profil à explorer, en un clic — données fictives.",
    demoCoop: "Démo Coopérative",
    demoCoopSub: "Amadou · Coop. de Soubré",
    demoExport: "Démo Exportateur",
    demoExportSub: "Marc · Cacao Export CI",
    or: "ou avec vos identifiants",
    email: "E-mail",
    password: "Mot de passe",
    submit: "Se connecter",
    noAccount: "Pas encore de compte ?",
    signup: "Créer un compte",
    missing: "Renseignez votre e-mail et votre mot de passe.",
    failed: "Connexion impossible.",
  },
  en: {
    title: "Sign in",
    subtitle: "Access your EUDR compliance workspace.",
    demoTitle: "Demo accounts",
    demoHint: "Pick the profile to explore, in one click — fictional data.",
    demoCoop: "Cooperative demo",
    demoCoopSub: "Amadou · Soubré coop.",
    demoExport: "Exporter demo",
    demoExportSub: "Marc · Cacao Export CI",
    or: "or with your credentials",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    noAccount: "No account yet?",
    signup: "Create an account",
    missing: "Enter your email and password.",
    failed: "Unable to sign in.",
  },
} as const;

/** Chemin de redirection interne demandé (?redirect=), sinon null (anti open-redirect). */
function redirectParam(): string | null {
  if (typeof window === "undefined") return null;
  const r = new URLSearchParams(window.location.search).get("redirect");
  return r && r.startsWith("/") && !r.startsWith("//") ? r : null;
}

export default function ConnexionPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const { lang } = useLanguage();
  const t = COPY[lang] ?? COPY.fr;
  const reduce = useReducedMotion();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) router.replace(redirectParam() ?? landingFor(user.role));
  }, [loading, user, router]);

  const doLogin = React.useCallback(
    (em: string, pw: string) => {
      setError(null);
      if (!em || !pw) {
        setError(t.missing);
        return;
      }
      setPending(true);
      // Latence courte : ressenti « vrai SaaS ».
      window.setTimeout(() => {
        const res = login(em, pw);
        if (res.ok) router.replace(redirectParam() ?? landingFor(res.role));
        else {
          setError(res.error ?? t.failed);
          setPending(false);
        }
      }, 450);
    },
    [login, router, t],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };
  const onDemoCoop = () => {
    setEmail(COOP_DEMO_ACCOUNT.email);
    setPassword(COOP_DEMO_ACCOUNT.password);
    doLogin(COOP_DEMO_ACCOUNT.email, COOP_DEMO_ACCOUNT.password);
  };
  const onDemoExport = () => {
    setEmail(EXPORT_DEMO_ACCOUNT.email);
    setPassword(EXPORT_DEMO_ACCOUNT.password);
    doLogin(EXPORT_DEMO_ACCOUNT.email, EXPORT_DEMO_ACCOUNT.password);
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
          <h1 className="font-display text-3xl text-forest-950">{t.title}</h1>
          <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>

          {/* Encart compte de démonstration — identifiants jamais affichés en clair (U-07) :
              le bouton connecte directement, sans exposer le mot de passe. */}
          <div className="mt-7 rounded-2xl border border-green-signal/25 bg-green-signal/[0.06] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-forest-950">
              <Sparkles size={16} className="text-green-signal" aria-hidden />
              {t.demoTitle}
            </div>
            <p className="mt-2 text-xs text-stone-600">{t.demoHint}</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={onDemoCoop}
                disabled={pending}
                className="group flex items-center gap-3 rounded-xl bg-green-signal px-4 py-3 text-left text-white shadow-[0_12px_36px_-14px_rgba(22,163,74,0.8)] outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-70"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15">
                  {pending ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} aria-hidden />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{t.demoCoop}</span>
                  <span className="block truncate text-[0.7rem] text-white/75">{t.demoCoopSub}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={onDemoExport}
                disabled={pending}
                className="group flex items-center gap-3 rounded-xl bg-forest-950 px-4 py-3 text-left text-white shadow-[0_12px_36px_-14px_rgba(10,31,20,0.7)] outline-none transition-[filter] hover:brightness-125 focus-visible:ring-2 focus-visible:ring-forest-950 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-70"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-amber-soft">
                  {pending ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} aria-hidden />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{t.demoExport}</span>
                  <span className="block truncate text-[0.7rem] text-white/70">{t.demoExportSub}</span>
                </span>
              </button>
            </div>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-stone-400">
            <span className="h-px flex-1 bg-black/[0.08]" />
            {t.or}
            <span className="h-px flex-1 bg-black/[0.08]" />
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">{t.email}</span>
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
              <span className="text-sm font-medium text-forest-950">{t.password}</span>
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
              {t.submit}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            {t.noAccount}{" "}
            <Link href="/inscription" className="font-semibold text-forest-950 underline-offset-4 hover:underline">
              {t.signup}
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
