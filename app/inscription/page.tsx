"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COPY = {
  fr: {
    title: "Créer un compte",
    subtitle: "Quelques secondes pour équiper votre coopérative avant l'échéance RDUE.",
    bullets: [
      "Vérifications de parcelles illimitées",
      "Certificats prêts pour TRACES NT",
      "Dossier de conformité partageable avec votre exportateur",
    ],
    name: "Nom complet",
    org: "Organisation",
    orgPlaceholder: "Coopérative Agricole de…",
    email: "E-mail professionnel",
    password: "Mot de passe",
    passwordPlaceholder: "8 caractères minimum",
    submit: "Créer mon compte",
    haveAccount: "Déjà un compte ?",
    signin: "Se connecter",
    errName: "Indiquez votre nom.",
    errOrg: "Indiquez votre organisation.",
    errEmail: "E-mail invalide.",
    errPassword: "8 caractères minimum.",
    failed: "Inscription impossible.",
  },
  en: {
    title: "Create an account",
    subtitle: "A few seconds to equip your cooperative before the EUDR deadline.",
    bullets: [
      "Unlimited plot verifications",
      "Certificates ready for TRACES NT",
      "Compliance file you can share with your exporter",
    ],
    name: "Full name",
    org: "Organization",
    orgPlaceholder: "Agricultural Cooperative of…",
    email: "Work email",
    password: "Password",
    passwordPlaceholder: "8 characters minimum",
    submit: "Create my account",
    haveAccount: "Already have an account?",
    signin: "Sign in",
    errName: "Enter your name.",
    errOrg: "Enter your organization.",
    errEmail: "Invalid email.",
    errPassword: "8 characters minimum.",
    failed: "Unable to sign up.",
  },
} as const;

export default function InscriptionPage() {
  const router = useRouter();
  const { user, loading, signup } = useAuth();
  const { lang } = useLanguage();
  const t = COPY[lang] ?? COPY.fr;
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
    if (nom.trim().length < 2) e.nom = t.errName;
    if (organisation.trim().length < 2) e.organisation = t.errOrg;
    if (!EMAIL_RE.test(email.trim())) e.email = t.errEmail;
    if (password.length < 8) e.password = t.errPassword;
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
        setGlobalError(res.error ?? t.failed);
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
          <h1 className="font-display text-3xl text-forest-950">{t.title}</h1>
          <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>

          <ul className="mt-5 flex flex-col gap-1.5 text-sm text-stone-600">
            {t.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check size={15} className="text-green-signal" aria-hidden /> {b}
              </li>
            ))}
          </ul>

          <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">{t.name}</span>
              <input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" placeholder="Amadou Koné" className={fieldCls("nom")} />
              {errors.nom && <span className="text-xs text-red-block">{errors.nom}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">{t.org}</span>
              <input value={organisation} onChange={(e) => setOrganisation(e.target.value)} autoComplete="organization" placeholder={t.orgPlaceholder} className={fieldCls("organisation")} />
              {errors.organisation && <span className="text-xs text-red-block">{errors.organisation}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">{t.email}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="vous@cooperative.ci" className={fieldCls("email")} />
              {errors.email && <span className="text-xs text-red-block">{errors.email}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">{t.password}</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder={t.passwordPlaceholder} className={fieldCls("password")} />
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
              {t.submit}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            {t.haveAccount}{" "}
            <Link href="/connexion" className="font-semibold text-forest-950 underline-offset-4 hover:underline">
              {t.signin}
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
