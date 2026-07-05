"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { User, Building2, Shield, Check, Save, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { FILIERES, type FiliereId } from "@/config/filieres";
import { useLanguage } from "@/components/language-provider";

type Tab = "profil" | "organisation" | "securite";

const TR = {
  fr: {
    eyebrow: "Paramètres",
    title: "Réglages du compte",
    sub: "Gérez votre profil, votre organisation et la sécurité de l'accès.",
    tabs: { profil: "Profil", organisation: "Organisation", securite: "Sécurité" },
    savedProfil: "Profil enregistré.",
    savedOrg: "Organisation enregistrée.",
    savedPwd: "Mot de passe mis à jour.",
    save: "Enregistrer",
    profil: { nom: "Nom complet", fonction: "Fonction", fonctionDefault: "Gérant de coopérative", email: "E-mail" },
    org: { coop: "Coopérative / organisation", region: "Région", filieres: "Filières couvertes" },
    sec: {
      pwdTitle: "Mot de passe", cur: "Mot de passe actuel", nw: "Nouveau mot de passe", cf: "Confirmer",
      errCur: "Saisissez votre mot de passe actuel.",
      errLen: "Le nouveau mot de passe doit faire au moins 8 caractères.",
      errMatch: "La confirmation ne correspond pas.",
      devices: "Appareils connectés", current: "Actuel", disconnect: "Déconnecter",
      sessionNow: "Session actuelle", twoDays: "Il y a 2 jours", mobileApp: "Application mobile · Android",
    },
  },
  en: {
    eyebrow: "Settings",
    title: "Account settings",
    sub: "Manage your profile, your organisation and access security.",
    tabs: { profil: "Profile", organisation: "Organisation", securite: "Security" },
    savedProfil: "Profile saved.",
    savedOrg: "Organisation saved.",
    savedPwd: "Password updated.",
    save: "Save",
    profil: { nom: "Full name", fonction: "Role", fonctionDefault: "Cooperative manager", email: "Email" },
    org: { coop: "Cooperative / organisation", region: "Region", filieres: "Commodities covered" },
    sec: {
      pwdTitle: "Password", cur: "Current password", nw: "New password", cf: "Confirm",
      errCur: "Enter your current password.",
      errLen: "The new password must be at least 8 characters.",
      errMatch: "The confirmation does not match.",
      devices: "Connected devices", current: "Current", disconnect: "Sign out",
      sessionNow: "Current session", twoDays: "2 days ago", mobileApp: "Mobile app · Android",
    },
  },
};
type Tr = (typeof TR)["fr"];

const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-green-signal focus:ring-2 focus:ring-green-signal/15";

export default function ParametresPage() {
  const reduce = useReducedMotion() ?? false;
  const { user } = useAuth();
  const { lang } = useLanguage();
  const t = TR[lang];
  const [tab, setTab] = useState<Tab>("profil");
  const [toast, setToast] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  const tabs: { id: Tab; label: string; Icon: LucideIcon }[] = [
    { id: "profil", label: t.tabs.profil, Icon: User },
    { id: "organisation", label: t.tabs.organisation, Icon: Building2 },
    { id: "securite", label: t.tabs.securite, Icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status"
            className="flex items-center gap-2.5 rounded-2xl border border-green-signal/20 bg-green-signal/[0.06] px-4 py-3 text-sm text-forest-950">
            <Check size={18} className="shrink-0 text-green-signal" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl text-forest-950">{t.title}</h1>
        <p className="mt-1 text-sm text-stone-500">{t.sub}</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-black/[0.06]">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium outline-none transition-colors ${tab === id ? "border-green-signal text-forest-950" : "border-transparent text-stone-500 hover:text-forest-950"}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === "profil" && <ProfilPanel t={t} nom={user?.nom ?? ""} email={user?.email ?? ""} onSave={() => notify(t.savedProfil)} />}
      {tab === "organisation" && <OrganisationPanel t={t} organisation={user?.organisation ?? ""} onSave={() => notify(t.savedOrg)} />}
      {tab === "securite" && <SecuritePanel t={t} onSave={() => notify(t.savedPwd)} />}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="card-premium p-6">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-forest-950">{label}</span>
      {children}
    </label>
  );
}
function SaveBtn({ label }: { label: string }) {
  return (
    <button type="submit" className="btn-green mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
      <Save size={16} /> {label}
    </button>
  );
}

function ProfilPanel({ t, nom, email, onSave }: { t: Tr; nom: string; email: string; onSave: () => void }) {
  const [n, setN] = useState(nom);
  const [e, setE] = useState(email);
  const [fonction, setFonction] = useState(t.profil.fonctionDefault);
  return (
    <Card>
      <form onSubmit={(ev) => { ev.preventDefault(); onSave(); }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.profil.nom}><input value={n} onChange={(ev) => setN(ev.target.value)} className={inputCls} /></Field>
          <Field label={t.profil.fonction}><input value={fonction} onChange={(ev) => setFonction(ev.target.value)} className={inputCls} /></Field>
          <Field label={t.profil.email}><input type="email" value={e} onChange={(ev) => setE(ev.target.value)} className={inputCls} /></Field>
        </div>
        <SaveBtn label={t.save} />
      </form>
    </Card>
  );
}

function OrganisationPanel({ t, organisation, onSave }: { t: Tr; organisation: string; onSave: () => void }) {
  const [org, setOrg] = useState(organisation);
  const [region, setRegion] = useState("Nawa · Soubré");
  const [filieres, setFilieres] = useState<Set<FiliereId>>(new Set(["cacao"]));
  const toggle = (id: FiliereId) => setFilieres((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  return (
    <Card>
      <form onSubmit={(ev) => { ev.preventDefault(); onSave(); }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.org.coop}><input value={org} onChange={(ev) => setOrg(ev.target.value)} className={inputCls} /></Field>
          <Field label={t.org.region}><input value={region} onChange={(ev) => setRegion(ev.target.value)} className={inputCls} /></Field>
        </div>
        <div className="mt-5">
          <span className="text-sm font-medium text-forest-950">{t.org.filieres}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {FILIERES.map((f) => {
              const on = filieres.has(f.id);
              return (
                <button key={f.id} type="button" onClick={() => toggle(f.id)} aria-pressed={on}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${on ? "bg-green-signal text-white shadow-[0_10px_24px_-12px_rgba(22,163,74,0.75)]" : "border border-black/[0.06] bg-white text-stone-600 hover:border-green-signal/40 hover:text-forest-950"}`}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.couleur }} /> {f.label}
                </button>
              );
            })}
          </div>
        </div>
        <SaveBtn label={t.save} />
      </form>
    </Card>
  );
}

function SecuritePanel({ t, onSave }: { t: Tr; onSave: () => void }) {
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [cf, setCf] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setErr(null);
    if (!cur) { setErr(t.sec.errCur); return; }
    if (nw.length < 8) { setErr(t.sec.errLen); return; }
    if (nw !== cf) { setErr(t.sec.errMatch); return; }
    setCur(""); setNw(""); setCf("");
    onSave();
  };
  const sessions = [
    { device: "Chrome · Windows", place: "Abidjan, CI", when: t.sec.sessionNow, current: true },
    { device: t.sec.mobileApp, place: "Soubré, CI", when: t.sec.twoDays, current: false },
  ];
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <h2 className="font-display text-lg text-forest-950">{t.sec.pwdTitle}</h2>
        <form onSubmit={submit} className="mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.sec.cur}><input type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" className={inputCls} /></Field>
            <Field label={t.sec.nw}><input type="password" value={nw} onChange={(e) => setNw(e.target.value)} autoComplete="new-password" className={inputCls} /></Field>
            <Field label={t.sec.cf}><input type="password" value={cf} onChange={(e) => setCf(e.target.value)} autoComplete="new-password" className={inputCls} /></Field>
          </div>
          {err && <p className="mt-3 text-sm text-red-block">{err}</p>}
          <SaveBtn label={t.save} />
        </form>
      </Card>
      <Card>
        <h2 className="font-display text-lg text-forest-950">{t.sec.devices}</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {sessions.map((s) => (
            <li key={s.device} className="flex items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3">
              <div>
                <div className="text-sm font-medium text-forest-950">{s.device}</div>
                <div className="text-xs text-stone-500">{s.place} · {s.when}</div>
              </div>
              {s.current ? (
                <span className="rounded-full bg-green-signal/12 px-2.5 py-1 text-xs font-semibold text-green-signal">{t.sec.current}</span>
              ) : (
                <button type="button" className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-red-block/40 hover:text-red-block">{t.sec.disconnect}</button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
