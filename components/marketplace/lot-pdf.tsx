"use client";

import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { parcellesExpedition, type Expedition } from "@/data/mock-expeditions";
import { FILIERE_LABEL, fmtHa } from "@/data/mock-parcelles";
import { takeRate, type MarketLot } from "@/data/mock-marketplace";

/**
 * Documents AGRIVO MARKET au format PDF :
 *  - "fiche"       : dossier de confiance PUBLIC d'un lot (téléchargeable par tout acheteur) ;
 *  - "reservation" : bon de réservation émis quand un acheteur connecté réserve un lot scellé.
 * Module « lourd » (@react-pdf/renderer) chargé UNIQUEMENT à la demande (import dynamique au clic).
 * Charte : « évaluation » jamais « garantie », commerce des fèves,jamais de financement/crédit,
 * la commission porte sur la TRANSACTION, jamais sur le producteur.
 */
const C = {
  forest: "#0a1f14",
  green: "#16a34a",
  amber: "#c8861d",
  ivoryDeep: "#efe8d8",
  stone: "#6b6256",
  stoneLight: "#9a9183",
  line: "#e0d9c9",
};

const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 62, paddingHorizontal: 48, fontSize: 10, color: C.forest, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 14 },
  brand: { fontFamily: "Times-Bold", fontSize: 20, color: C.forest },
  brandMkt: { fontFamily: "Helvetica-Bold", fontSize: 9, color: C.amber, letterSpacing: 2 },
  brandSub: { fontFamily: "Times-Italic", fontSize: 10, color: C.stone, marginTop: 3 },
  refLabel: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, textAlign: "right" },
  ref: { fontFamily: "Courier", fontSize: 11, color: C.forest, textAlign: "right" },
  kind: { marginTop: 18, fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", color: C.green },
  title: { fontFamily: "Times-Italic", fontSize: 17, marginTop: 4 },
  seal: { marginTop: 12, borderRadius: 6, padding: 12, borderWidth: 1 },
  sealLabel: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  crit: { flexDirection: "row", marginTop: 5 },
  critMark: { width: 12, fontFamily: "Helvetica-Bold", fontSize: 9 },
  critTxt: { flex: 1, fontSize: 8.5, color: C.stone, lineHeight: 1.45 },
  grid: { marginTop: 16, flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "33.33%", marginBottom: 10 },
  cellLabel: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  cellValue: { fontSize: 10.5 },
  mono: { fontFamily: "Courier", fontSize: 9.5 },
  reserveBox: { marginTop: 14, backgroundColor: "#eaf6ee", borderWidth: 1, borderColor: C.green, borderRadius: 6, padding: 11 },
  sectionTitle: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 6 },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.line, paddingVertical: 4.5 },
  tHead: { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.stone, textTransform: "uppercase", letterSpacing: 0.6 },
  tCell: { fontSize: 9 },
  note: { marginTop: 16, backgroundColor: C.ivoryDeep, borderRadius: 6, padding: 11, fontSize: 8.5, color: C.stone, lineHeight: 1.55 },
  footer: { position: "absolute", bottom: 28, left: 48, right: 48, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerText: { fontSize: 7.5, color: C.stoneLight, lineHeight: 1.5, maxWidth: 380 },
  qr: { width: 74, height: 74 },
});

export type LotPdfKind = "fiche" | "reservation";

function LotDocument({
  exp, lot, lang, kind, acheteur, qrDataUrl,
}: {
  exp: Expedition; lot: MarketLot; lang: "fr" | "en"; kind: LotPdfKind; acheteur?: string; qrDataUrl?: string;
}) {
  const en = lang === "en";
  const parcelles = parcellesExpedition(exp);
  const verifie = lot.sceau.statut === "verifie";
  const url = `https://agrivo-io.vercel.app/marketplace/lot/${lot.ref}`;
  const kindLabel = kind === "reservation"
    ? (en ? "Reservation voucher" : "Bon de réservation")
    : (en ? "Lot file · trust dossier" : "Fiche lot · dossier de confiance");

  return (
    <Document title={`${kindLabel} ${lot.ref}`} author="Agrivo Market">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Agrivo <Text style={styles.brandMkt}>MARKET</Text></Text>
            <Text style={styles.brandSub}>{en ? "Marketplace of verified-compliant lots" : "Place de marché des lots conformes vérifiés"}</Text>
          </View>
          <View>
            <Text style={styles.refLabel}>{en ? "Lot reference" : "Référence du lot"}</Text>
            <Text style={styles.ref}>{lot.ref}</Text>
            <Text style={[styles.refLabel, { marginTop: 4 }]}>{en ? "Issued on" : "Émis le"}</Text>
            <Text style={{ fontSize: 9, color: C.stone, textAlign: "right" }}>
              {new Date().toLocaleDateString(en ? "en-GB" : "fr-FR", { dateStyle: "long" })}
            </Text>
          </View>
        </View>

        <Text style={styles.kind}>{kindLabel}</Text>
        <Text style={styles.title}>{lot.nomLot}</Text>

        {/* Sceau + 4 critères */}
        <View style={[styles.seal, { borderColor: verifie ? C.green : C.amber, backgroundColor: verifie ? "#eaf6ee" : "#fbf3e5" }]}>
          <Text style={[styles.sealLabel, { color: verifie ? C.green : C.amber }]}>
            {verifie ? (en ? "AGRIVO seal · verified" : "Sceau AGRIVO · vérifié") : (en ? "AGRIVO seal · in preparation" : "Sceau AGRIVO · en préparation")}
          </Text>
          {lot.sceau.criteres.map((c) => (
            <View key={c.code} style={styles.crit}>
              <Text style={[styles.critMark, { color: c.ok ? C.green : C.amber }]}>{c.ok ? "OK" : "!"}</Text>
              <Text style={styles.critTxt}>{en ? c.en : c.fr}</Text>
            </View>
          ))}
        </View>

        {/* Bloc commercial */}
        <View style={styles.grid}>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Commodity · HS code" : "Filière · code SH"}</Text>
            <Text style={styles.cellValue}>{FILIERE_LABEL[lot.filiere]} · {exp.codeSH}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Harvest" : "Campagne"}</Text>
            <Text style={styles.cellValue}>{lot.campagne}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Tonnage" : "Tonnage"}</Text>
            <Text style={[styles.cellValue, styles.mono]}>{lot.tonnage.toFixed(1)} t</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Indicative price" : "Prix indicatif"}</Text>
            <Text style={[styles.cellValue, styles.mono]}>{fcfa(lot.prixIndicatifFcfaKg)} FCFA/kg</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Lot value" : "Valeur du lot"}</Text>
            <Text style={[styles.cellValue, styles.mono]}>{fcfa(lot.valeurFcfa)} FCFA</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "AGRIVO commission (est. 2%)" : "Commission AGRIVO (est. 2 %)"}</Text>
            <Text style={[styles.cellValue, styles.mono, { color: C.green }]}>{fcfa(takeRate(lot.valeurFcfa))} FCFA</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Departure port" : "Port de départ"}</Text>
            <Text style={styles.cellValue}>{lot.portDepart}</Text>
          </View>
          <View style={[styles.cell, { width: "66.66%" }]}>
            <Text style={styles.cellLabel}>{en ? "Cooperatives · regions" : "Coopératives · régions"}</Text>
            <Text style={styles.cellValue}>{lot.cooperatives.join(", ")} · {lot.regions.join(", ")}</Text>
          </View>
        </View>

        {kind === "reservation" && (
          <View style={styles.reserveBox}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10, color: C.green }}>
              {en ? "Reservation recorded" : "Réservation enregistrée"}{acheteur ? ` · ${acheteur}` : ""}
            </Text>
            <Text style={{ fontSize: 8.5, color: C.stone, marginTop: 3, lineHeight: 1.5 }}>
              {en
                ? "AGRIVO puts you in touch with the exporter to finalise the transaction directly. AGRIVO does not handle payment or financing; its commission applies to the transaction, never to the producer."
                : "AGRIVO vous met en relation avec l'exportateur pour finaliser la transaction en direct. AGRIVO n'intervient ni dans le paiement ni dans le financement ; sa commission porte sur la transaction, jamais sur le producteur."}
            </Text>
          </View>
        )}

        {/* Parcelles d'origine */}
        <Text style={styles.sectionTitle}>{en ? "Plots of origin (double lock: producer card + verified polygon)" : "Parcelles d'origine (double verrou : carte producteur + polygone vérifié)"}</Text>
        <View style={styles.tRow}>
          <Text style={[styles.tHead, { width: "27%" }]}>{en ? "Farmer" : "Producteur"}</Text>
          <Text style={[styles.tHead, { width: "21%" }]}>{en ? "Farmer card" : "Carte producteur"}</Text>
          <Text style={[styles.tHead, { width: "20%" }]}>{en ? "Certificate" : "Certificat"}</Text>
          <Text style={[styles.tHead, { width: "20%" }]}>DDR</Text>
          <Text style={[styles.tHead, { width: "12%" }]}>{en ? "Area" : "Superf."}</Text>
        </View>
        {parcelles.map((p) => (
          <View key={p.id} style={styles.tRow}>
            <Text style={[styles.tCell, { width: "27%" }]}>{p.producteurNom}</Text>
            <Text style={[styles.tCell, styles.mono, { width: "21%" }]}>{p.numeroCartePro}</Text>
            <Text style={[styles.tCell, styles.mono, { width: "20%" }]}>{p.numeroCertificat}</Text>
            <Text style={[styles.tCell, styles.mono, { width: "20%" }]}>{p.referenceDDR ?? "—"}</Text>
            <Text style={[styles.tCell, styles.mono, { width: "12%" }]}>{fmtHa(p.superficieHa)}</Text>
          </View>
        ))}
        <Text style={{ fontSize: 7.5, color: C.stoneLight, marginTop: 4 }}>
          {en
            ? `Volume integrity: each draw stays under the anti-fraud cap (area × regional yield). Total ${lot.tonnage.toFixed(1)} t over ${parcelles.length} plots.`
            : `Intégrité de volume : chaque prélèvement reste sous le plafond anti-fraude (superficie × rendement régional). Total ${lot.tonnage.toFixed(1)} t sur ${parcelles.length} parcelles.`}
        </Text>

        <View style={styles.note}>
          <Text>
            {en
              ? "AGRIVO Market lists compliant lots and connects buyers and exporters. This document reflects an assessment from public satellite data (Whisp method, FAO) and does not constitute a guarantee, nor does it replace the operator's due diligence statement (DDS) under Regulation (EU) 2023/1115. AGRIVO trades compliant beans,never financing or credit."
              : "AGRIVO Market référence des lots conformes et met en relation acheteurs et exportateurs. Ce document reflète une évaluation issue de données satellites publiques (méthode Whisp, FAO) ; il ne constitue pas une garantie et ne remplace pas la déclaration de diligence raisonnée (DDS) de l'opérateur au sens du règlement (UE) 2023/1115. AGRIVO fait le commerce des fèves conformes,jamais le financement ni le crédit."}
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {en
              ? `Public verification of this lot: scan the QR code or visit ${url}`
              : `Vérification publique de ce lot : scannez le QR code ou visitez ${url}`}
          </Text>
          {qrDataUrl ? <Image src={qrDataUrl} style={styles.qr} /> : null}
        </View>
      </Page>
    </Document>
  );
}

/** Génère et télécharge le PDF d'un lot (fiche de confiance ou bon de réservation). */
export async function telechargerLotPdf(
  exp: Expedition,
  lot: MarketLot,
  lang: "fr" | "en",
  kind: LotPdfKind = "fiche",
  acheteur?: string,
): Promise<void> {
  let qrDataUrl: string | undefined;
  try {
    qrDataUrl = await QRCode.toDataURL(`https://agrivo-io.vercel.app/marketplace/lot/${lot.ref}`, {
      width: 220,
      margin: 1,
      color: { dark: "#0a1f14", light: "#ffffff" },
    });
  } catch {
    /* QR indisponible : le PDF part sans (jamais bloquant) */
  }
  const blob = await pdf(
    <LotDocument exp={exp} lot={lot} lang={lang} kind={kind} acheteur={acheteur} qrDataUrl={qrDataUrl} />,
  ).toBlob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `agrivo-market-${kind === "reservation" ? "reservation" : "fiche"}-${lot.ref}.pdf`;
  a.click();
  URL.revokeObjectURL(a.href);
}
