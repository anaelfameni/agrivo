"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/components/auth-provider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InscriptionPage() {
  const router = useRouter();
  const { user, loading, signup } = useAuth();
  const reduce = useReducedMotion();
  const [nom, setNom] = React.useState("");
  const [organisation, setOrganisation] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) router.replace("/app/dashboard");
  }, [loading, user, router]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (nom.trim().length < 2) e.nom = "Indiquez votre nom.";
    if (organisation.trim().length < 2) e.organisation = "Indiquez votre organisation.";
    if (!EMAIL_RE.test(email.trim())) e.email = "E-mail invalide.";
    if (password.length < 8) e.password = "8 caractères minimum.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setGlobalError(null);
    if (!validate()) return;
    setPending(true);
    window.setTimeout(() => {
      const res = signup({ nom, email, organisation, password });
      if (res.ok) router.replace("/app/dashboard");
      else {
        setGlobalError(res.error ?? "Inscription impossible.");
        setPending(false);
      }
    }, 500);
  };

  const fieldCls = (key: string) =>
    `w-full rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-green-signal/20 ${
      errors[key] ? "border-red-block/50 focus:border-red-block" : "border-black/10 focus:border-green-signal"
    }`;

  return (
    <div className="min-h-dvh bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main className="mx-auto flex w-full max-w-md flex-col px-6 pb-24 pt-14 md:pt-20">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-3xl text-forest-950">Créer un compte</h1>
          <p className="mt-2 text-sm text-stone-500">
            Quelques secondes pour équiper votre coopérative avant l&apos;échéance RDUE.
          </p>

          <ul className="mt-5 flex flex-col gap-1.5 text-sm text-stone-600">
            {["Vérifications de parcelles illimitées", "Certificats prêts pour TRACES NT", "Accès au micro-crédit des producteurs conformes"].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check size={15} className="text-green-signal" aria-hidden /> {b}
              </li>
            ))}
          </ul>

          <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">Nom complet</span>
              <input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" placeholder="Amadou Koné" className={fieldCls("nom")} />
              {errors.nom && <span className="text-xs text-red-block">{errors.nom}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">Organisation</span>
              <input value={organisation} onChange={(e) => setOrganisation(e.target.value)} autoComplete="organization" placeholder="Coopérative Agricole de…" className={fieldCls("organisation")} />
              {errors.organisation && <span className="text-xs text-red-block">{errors.organisation}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">E-mail professionnel</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="vous@cooperative.ci" className={fieldCls("email")} />
              {errors.email && <span className="text-xs text-red-block">{errors.email}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">Mot de passe</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="8 caractères minimum" className={fieldCls("password")} />
              {errors.password && <span className="text-xs text-red-block">{errors.password}</span>}
            </label>

            {globalError && (
              <p role="alert" className="rounded-lg bg-red-block/[0.08] px-3 py-2 text-sm text-red-block">
                {globalError}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_-12px_rgba(22,163,74,0.8)] transition-[filter] hover:brightness-110 disabled:opacity-70"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : null}
              Créer mon compte
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-semibold text-forest-950 underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
