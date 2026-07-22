"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Send, Check, Building2, MessageSquare, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/components/language-provider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-green-signal focus:ring-2 focus:ring-green-signal/15";

export default function ContactPage() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const reduce = useReducedMotion() ?? false;
  const [form, setForm] = useState({ nom: "", email: "", organisation: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.nom.trim().length < 2) er.nom = en ? "Enter your name." : "Indiquez votre nom.";
    if (!EMAIL_RE.test(form.email.trim())) er.email = en ? "Invalid email." : "E-mail invalide.";
    if (form.message.trim().length < 10) er.message = en ? "Your message is a bit short." : "Votre message est un peu court.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      setSent(true);
    }, 700);
  };

  return (
    <div className="min-h-dvh bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 md:px-8 md:pt-20">
        <p className="eyebrow text-amber-cacao">Contact</p>
        <h1 className="mt-3 font-display text-4xl text-forest-950">{en ? "Let\u2019s talk about your compliance." : "Parlons de votre mise en conformité."}</h1>
        <p className="mt-3 max-w-xl text-stone-600">
          {en
            ? "A product question, a demo for your cooperative, a partnership? Write to us: we reply within 48 business hours."
            : "Une question produit, une démonstration pour votre coopérative, un partenariat ? Écrivez-nous : nous répondons sous 48 h ouvrées."}
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(10,31,20,0.04)] md:p-8">
            {sent ? (
              <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-8 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-green-signal/12 text-green-signal">
                  <Check size={28} strokeWidth={2.2} />
                </span>
                <h2 className="mt-4 font-display text-2xl text-forest-950">{en ? "Message sent" : "Message envoyé"}</h2>
                <p className="mt-2 max-w-sm text-sm text-stone-600">
                  {en
                    ? <>Thank you {form.nom.split(" ")[0]}. Our team will get back to you at {form.email} within 48 business hours.</>
                    : <>Merci {form.nom.split(" ")[0]}. Notre équipe revient vers vous à l&apos;adresse {form.email} sous 48 h ouvrées.</>}
                </p>
                <button type="button" onClick={() => { setSent(false); setForm({ nom: "", email: "", organisation: "", message: "" }); }} className="mt-6 rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:text-forest-950">
                  {en ? "Send another message" : "Envoyer un autre message"}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-forest-950">{en ? "Full name" : "Nom complet"}</span>
                    <input value={form.nom} onChange={set("nom")} className={inputCls} placeholder="Amadou Koné" />
                    {errors.nom && <span className="text-xs text-red-block">{errors.nom}</span>}
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-forest-950">{en ? "Organization" : "Organisation"}</span>
                    <input value={form.organisation} onChange={set("organisation")} className={inputCls} placeholder={en ? "Cooperative, exporter…" : "Coopérative, exportateur…"} />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-forest-950">{en ? "Email" : "E-mail"}</span>
                  <input type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="vous@organisation.ci" />
                  {errors.email && <span className="text-xs text-red-block">{errors.email}</span>}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-forest-950">Message</span>
                  <textarea value={form.message} onChange={set("message")} rows={5} className={`${inputCls} resize-y`} placeholder={en ? "Describe your need…" : "Décrivez votre besoin…"} />
                  {errors.message && <span className="text-xs text-red-block">{errors.message}</span>}
                </label>
                <button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] transition-[filter] hover:brightness-105 disabled:opacity-70">
                  {pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {en ? "Send the message" : "Envoyer le message"}
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <ContactCard Icon={Building2} title={en ? "Sales" : "Commercial"} desc={en ? "Demo, pricing, deployment for your cooperative or as an exporter." : "Démonstration, tarifs, déploiement pour votre coopérative ou en tant qu'exportateur."} email="commercial@agrivo.ci" />
            <ContactCard Icon={MessageSquare} title="Support" desc={en ? "Usage help, technical questions, account access." : "Aide à l'utilisation, questions techniques, accès à votre compte."} email="support@agrivo.ci" />
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 text-sm text-stone-600">
              <div className="flex items-center gap-2 font-medium text-forest-950">
                <Mail size={16} className="text-green-signal" /> {en ? "Reply within 48 business hours" : "Réponse sous 48 h ouvrées"}
              </div>
              <p className="mt-2">{en ? "For any request, the form opposite remains the fastest channel: it reaches the team directly." : "Pour toute demande, le formulaire ci-contre reste le canal le plus rapide : il arrive directement à l'équipe."}</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ContactCard({ Icon, title, desc, email }: { Icon: typeof Building2; title: string; desc: string; email: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-ivory-deep/60 text-green-signal">
        <Icon size={18} />
      </span>
      <h3 className="mt-3 font-display text-lg text-forest-950">{title}</h3>
      <p className="mt-1 text-sm text-stone-600">{desc}</p>
      <p className="num mt-2 text-sm text-forest-950">{email}</p>
    </div>
  );
}
