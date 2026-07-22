"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Check, Building2, Globe } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth, landingFor } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Role = "coop" | "exporter";

const COPY = {
  fr: {
    title: "Créer un compte",
    subtitle: {
      coop: "Quelques secondes pour équiper votre coopérative avant l'échéance RDUE.",
      exporter: "Quelques secondes pour piloter la conformité de votre portefeuille d'export.",
    },
    roleQuestion: "Je crée un compte en tant que :",
    roleCoop: "Coopérative",
    roleCoopDesc: "Je vérifie les parcelles de mes producteurs.",
    roleExport: "Exportateur",
    roleExportDesc: "Je pilote un portefeuille de coopératives.",
    bullets: {
      coop: [
        "Vérifications de parcelles illimitées",
        "Certificats d'évaluation de conformité prêts pour TRACES NT",
        "Dossier de conformité partageable avec votre exportateur",
      ],
      exporter: [
        "Portefeuille multi-coopératives, en un tableau de bord",
        "Export en masse + API REST",
        "Déclarations prêtes pour TRACES NT",
      ],
    },
    name: "Nom complet",
    org: "Organisation",
    orgPlaceholder: { coop: "Coopérative Agricole de…", exporter: "Nom de votre société d'export…" },
    email: "E-mail professionnel",
    emailPlaceholder: { coop: "vous@cooperative.ci", exporter: "vous@societe-export.ci" },
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
    subtitle: {
      coop: "A few seconds to equip your cooperative before the EUDR deadline.",
      exporter: "A few seconds to steer the compliance of your export portfolio.",
    },
    roleQuestion: "I'm creating an account as:",
    roleCoop: "Cooperative",
    roleCoopDesc: "I verify my farmers' plots.",
    roleExport: "Exporter",
    roleExportDesc: "I steer a portfolio of cooperatives.",
    bullets: {
      coop: [
        "Unlimited plot verifications",
        "Compliance-assessment certificates ready for TRACES NT",
        "Compliance file you can share with your exporter",
      ],
      exporter: [
        "Multi-cooperative portfolio, in one dashboard",
        "Batch export + REST API",
        "Declarations ready for TRACES NT",
      ],
    },
    name: "Full name",
    org: "Organization",
    orgPlaceholder: { coop: "Agricultural Cooperative of…", exporter: "Your export company name…" },
    email: "Work email",
    emailPlaceholder: { coop: "you@cooperative.ci", exporter: "you@export-company.ci" },
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
  const [role, setRole] = React.useState<Role>("coop");
  const [nom, setNom] = React.useState("");
  const [organisation, setOrganisation] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) router.replace(landingFor(user.role));
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
      const res = signup({ nom, email, organisation, password, role });
      if (res.ok) router.replace(landingFor(res.role));
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
          <p className="mt-2 text-sm text-stone-500">{t.subtitle[role]}</p>

          {/* Choix du profil : coopérative ou exportateur */}
          <div className="mt-6">
            <p className="text-sm font-medium text-forest-950">{t.roleQuestion}</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t.roleQuestion}>
              <RoleCard
                icon={<Building2 size={18} strokeWidth={2} aria-hidden />}
                title={t.roleCoop}
                desc={t.roleCoopDesc}
                selected={role === "coop"}
                onSelect={() => setRole("coop")}
              />
              <RoleCard
                icon={<Globe size={18} strokeWidth={2} aria-hidden />}
                title={t.roleExport}
                desc={t.roleExportDesc}
                selected={role === "exporter"}
                onSelect={() => setRole("exporter")}
              />
            </div>
          </div>

          <ul className="mt-5 flex flex-col gap-1.5 text-sm text-stone-600">
            {t.bullets[role].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check size={15} className="text-green-signal" aria-hidden /> {b}
              </li>
            ))}
          </ul>

          <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">{t.name}</span>
              <input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" placeholder={role === "coop" ? "Amadou Koné" : "Marc Kouassi"} className={fieldCls("nom")} />
              {errors.nom && <span className="text-xs text-red-block">{errors.nom}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">{t.org}</span>
              <input value={organisation} onChange={(e) => setOrganisation(e.target.value)} autoComplete="organization" placeholder={t.orgPlaceholder[role]} className={fieldCls("organisation")} />
              {errors.organisation && <span className="text-xs text-red-block">{errors.organisation}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-forest-950">{t.email}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder={t.emailPlaceholder[role]} className={fieldCls("email")} />
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

function RoleCard({
  icon,
  title,
  desc,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex flex-col gap-1.5 rounded-xl border p-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-signal ${
        selected ? "border-green-signal/50 bg-green-signal/[0.06]" : "border-black/[0.08] bg-white hover:border-green-signal/30"
      }`}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-lg ${selected ? "bg-green-signal text-white" : "bg-ivory-deep/70 text-forest-950"}`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="text-sm font-semibold text-forest-950">{title}</span>
      <span className="text-xs leading-relaxed text-stone-500">{desc}</span>
    </button>
  );
}
