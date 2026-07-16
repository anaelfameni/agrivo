"use client";

import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import {
  JALONS_ORDRE,
  JALON_LABEL,
  parcellesExpedition,
  plafondTonnes,
  statutExpedition,
  tonnageExpedition,
  type Expedition,
} from "@/data/mock-expeditions";
import { FILIERE_LABEL, fmtHa, formatDate } from "@/data/mock-parcelles";

/**
 * Dossier d'expédition RDUE au format PDF — le document que l'exportateur remet à son acheteur
 * européen. Module « lourd » (@react-pdf/renderer) : chargé UNIQUEMENT à la demande (import
 * dynamique au clic), jamais au SSR. Polices intégrées (Times/Helvetica/Courier) → zéro appel
 * réseau. Charte : « évaluation » jamais « garantie », jalons DOCUMENTAIRES, mention DDS verbatim.
 */
const C = {
  forest: "#0a1f14",
  green: "#16a34a",
  ivoryDeep: "#efe8d8",
  stone: "#6b6256",
  stoneLight: "#9a9183",
  line: "#e0d9c9",
};

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 60, paddingHorizontal: 48, fontSize: 10, color: C.forest, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 14 },
  brand: { fontFamily: "Times-Bold", fontSize: 20, color: C.forest },
  brandSub: { fontFamily: "Times-Italic", fontSize: 10, color: C.stone, marginTop: 2 },
  refLabel: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, textAlign: "right" },
  ref: { fontFamily: "Courier", fontSize: 11, color: C.forest, textAlign: "right" },
  title: { fontFamily: "Times-Italic", fontSize: 16, marginTop: 20 },
  verdict: { marginTop: 12, borderRadius: 6, padding: 12, borderWidth: 1, borderColor: C.green, backgroundColor: "#eaf6ee" },
  verdictLabel: { fontFamily: "Helvetica-Bold", fontSize: 11, color: C.green },
  grid: { marginTop: 16, flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "33.33%", marginBottom: 10 },
  cellLabel: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  cellValue: { fontSize: 10.5 },
  mono: { fontFamily: "Courier", fontSize: 9.5 },
  sectionTitle: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, marginTop: 14, marginBottom: 6 },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.line, paddingVertical: 4.5 },
  tHead: { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.stone, textTransform: "uppercase", letterSpacing: 0.6 },
  tCell: { fontSize: 9 },
  jalon: { flexDirection: "row", alignItems: "center", marginBottom: 3.5 },
  jalonPuce: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6 },
  jalonTxt: { fontSize: 9 },
  dds: { marginTop: 16, backgroundColor: C.ivoryDeep, borderRadius: 6, padding: 11, fontSize: 8.5, color: C.stone, lineHeight: 1.55 },
  footer: { position: "absolute", bottom: 28, left: 48, right: 48, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerText: { fontSize: 7.5, color: C.stoneLight, lineHeight: 1.5, maxWidth: 380 },
  qr: { width: 74, height: 74 },
});

function ExpeditionDocument({ exp, lang, qrDataUrl }: { exp: Expedition; lang: "fr" | "en"; qrDataUrl?: string }) {
  const en = lang === "en";
  const parcelles = parcellesExpedition(exp);
  const coops = [...new Set(parcelles.map((p) => p.cooperative))];
  const url = `https://agrivo-io.vercel.app/verifier-expedition?ref=${exp.ref}`;
  return (
    <Document title={`Dossier d'expédition ${exp.ref}`} author="Agrivo">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Agrivo</Text>
            <Text style={styles.brandSub}>{en ? "EUDR shipment compliance file" : "Dossier de conformité RDUE de l'expédition"}</Text>
          </View>
          <View>
            <Text style={styles.refLabel}>{en ? "Shipment reference" : "Référence d'expédition"}</Text>
            <Text style={styles.ref}>{exp.ref}</Text>
            <Text style={[styles.refLabel, { marginTop: 4 }]}>{en ? "Issued on" : "Émis le"}</Text>
            <Text style={{ fontSize: 9, color: C.stone, textAlign: "right" }}>
              {new Date().toLocaleDateString(en ? "en-GB" : "fr-FR", { dateStyle: "long" })}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{exp.nomLot}</Text>

        <View style={styles.verdict}>
          <Text style={styles.verdictLabel}>
            {en
              ? `${parcelles.length} plots of origin, 100% assessed "Compliant" (Whisp satellite method, FAO)`
              : `${parcelles.length} parcelles d'origine, 100 % évaluées « Conforme » (méthode satellite Whisp, FAO)`}
          </Text>
          <Text style={{ fontSize: 9, color: C.stone, marginTop: 3, lineHeight: 1.5 }}>
            {en
              ? "Strict segregation: no non-compliant plot can enter a lot. Volumes reconciled plot by plot against the anti-fraud cap (area × regional yield)."
              : "Ségrégation stricte : aucune parcelle non conforme ne peut entrer dans un lot. Volumes réconciliés parcelle par parcelle contre le plafond anti-fraude (superficie × rendement régional)."}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Buyer" : "Acheteur"}</Text>
            <Text style={styles.cellValue}>{exp.acheteur}{exp.paysAcheteur !== "À confirmer" ? ` · ${exp.paysAcheteur}` : ""}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Commodity · HS code" : "Filière · code SH"}</Text>
            <Text style={styles.cellValue}>{FILIERE_LABEL[exp.filiere]} · {exp.codeSH}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Total tonnage" : "Tonnage total"}</Text>
            <Text style={[styles.cellValue, styles.mono]}>{tonnageExpedition(exp)} t</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Route" : "Trajet"}</Text>
            <Text style={styles.cellValue}>{exp.portDepart} → {exp.portArrivee}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Vessel · container" : "Navire · conteneur"}</Text>
            <Text style={[styles.cellValue, styles.mono]}>{exp.navire ?? "·"}{exp.numeroConteneur ? ` · ${exp.numeroConteneur}` : ""}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Cooperatives" : "Coopératives"}</Text>
            <Text style={styles.cellValue}>{coops.join(", ")}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{en ? "Plots of origin (all geolocated, lot GeoJSON available)" : "Parcelles d'origine (toutes géolocalisées, GeoJSON du lot disponible)"}</Text>
        <View style={styles.tRow}>
          <Text style={[styles.tHead, { width: "26%" }]}>{en ? "Farmer" : "Producteur"}</Text>
          <Text style={[styles.tHead, { width: "20%" }]}>{en ? "Farmer card" : "Carte producteur"}</Text>
          <Text style={[styles.tHead, { width: "20%" }]}>{en ? "Certificate" : "Certificat"}</Text>
          <Text style={[styles.tHead, { width: "12%" }]}>{en ? "Area" : "Superficie"}</Text>
          <Text style={[styles.tHead, { width: "22%" }]}>{en ? "Tonnage (cap)" : "Tonnage (plafond)"}</Text>
        </View>
        {parcelles.map((p) => (
          <View key={p.id} style={styles.tRow}>
            <Text style={[styles.tCell, { width: "26%" }]}>{p.producteurNom}</Text>
            <Text style={[styles.tCell, styles.mono, { width: "20%" }]}>{p.numeroCartePro}</Text>
            <Text style={[styles.tCell, styles.mono, { width: "20%" }]}>{p.numeroCertificat}</Text>
            <Text style={[styles.tCell, styles.mono, { width: "12%" }]}>{fmtHa(p.superficieHa)}</Text>
            <Text style={[styles.tCell, styles.mono, { width: "22%" }]}>
              {exp.tonnages[p.id] ?? 0} t (≤ {Math.round(plafondTonnes(p) * 100) / 100})
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{en ? "Documentary milestones (declared)" : "Jalons documentaires (déclarés)"}</Text>
        {JALONS_ORDRE.map((code) => {
          const jalon = exp.jalons.find((j) => j.code === code);
          const atteint = Boolean(jalon);
          return (
            <View key={code} style={styles.jalon}>
              <View style={[styles.jalonPuce, { backgroundColor: atteint ? C.green : C.line }]} />
              <Text style={[styles.jalonTxt, { color: atteint ? C.forest : C.stoneLight }]}>
                {JALON_LABEL[code][lang]}
                {jalon ? `  ·  ${formatDate(jalon.date, lang)}` : ""}
                {jalon?.note ? `  ·  ${jalon.note[lang]}` : ""}
              </Text>
            </View>
          );
        })}

        <View style={styles.dds}>
          <Text>
            {en
              ? "This file documents the assessment carried out by Agrivo on the lot's plots of origin, from public satellite data (Whisp method, FAO). Milestones are declarative. It does not constitute a guarantee and does not replace the operator's due diligence statement (DDS): the operator remains solely responsible for compliance under Regulation (EU) 2023/1115. The lot's GeoJSON (RFC 7946, WGS-84) lists every plot of origin as required for the DDS on TRACES NT."
              : "Ce dossier documente l'évaluation réalisée par Agrivo sur les parcelles d'origine du lot, à partir de données satellites publiques (méthode Whisp, FAO). Les jalons sont déclaratifs. Il ne constitue pas une garantie et ne remplace pas la déclaration de diligence raisonnée (DDS) de l'opérateur, seul responsable de la conformité au sens du règlement (UE) 2023/1115. Le GeoJSON du lot (RFC 7946, WGS-84) liste toutes les parcelles d'origine, comme l'exige la DDS sur TRACES NT."}
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {en
              ? `Current milestone: ${JALON_LABEL[statutExpedition(exp).code].en}. Public verification: scan the QR code or visit ${url}`
              : `Jalon actuel : ${JALON_LABEL[statutExpedition(exp).code].fr}. Vérification publique : scannez le QR code ou visitez ${url}`}
          </Text>
          {qrDataUrl ? <Image src={qrDataUrl} style={styles.qr} /> : null}
        </View>
      </Page>
    </Document>
  );
}

/** Génère et télécharge le PDF du dossier d'expédition (appelé via import dynamique au clic). */
export async function telechargerExpeditionPdf(exp: Expedition, lang: "fr" | "en"): Promise<void> {
  let qrDataUrl: string | undefined;
  try {
    qrDataUrl = await QRCode.toDataURL(`https://agrivo-io.vercel.app/verifier-expedition?ref=${exp.ref}`, {
      width: 220,
      margin: 1,
      color: { dark: "#0a1f14", light: "#ffffff" },
    });
  } catch {
    /* QR indisponible : le PDF part sans (jamais bloquant) */
  }
  const blob = await pdf(<ExpeditionDocument exp={exp} lang={lang} qrDataUrl={qrDataUrl} />).toBlob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `agrivo-dossier-expedition-${exp.ref}.pdf`;
  a.click();
  URL.revokeObjectURL(a.href);
}
