"use client";

import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import type { CertificatData } from "@/lib/certificat-data";

/** URL publique de vérification du certificat (cible du QR code imprimé). */
function verificationUrl(numero: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://agrivo-io.vercel.app";
  return `${base}/verifier-certificat?ref=${encodeURIComponent(numero)}`;
}

/**
 * Certificat de conformité RDUE au format PDF (@react-pdf/renderer). Module « lourd » :
 * chargé UNIQUEMENT à la demande (import dynamique côté client), jamais au SSR ni au premier
 * chargement. Sans police externe (Times/Helvetica intégrées) → aucun appel réseau, démo sûre.
 */
const C = {
  forest: "#0a1f14",
  green: "#16a34a",
  amber: "#c8861d",
  red: "#b4231e",
  ivory: "#f7f3ea",
  ivoryDeep: "#efe8d8",
  stone: "#6b6256",
  stoneLight: "#9a9183",
  line: "#e0d9c9",
};

function statutColor(s: CertificatData["statut"]): string {
  return s === "conforme" ? C.green : s === "anomalie" ? C.red : C.amber;
}
function statutBg(s: CertificatData["statut"]): string {
  return s === "conforme" ? "#eaf6ee" : s === "anomalie" ? "#f8eae9" : "#f7efe0";
}

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 56, paddingHorizontal: 48, fontSize: 10, color: C.forest, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 16 },
  brand: { fontFamily: "Times-Bold", fontSize: 20, color: C.forest },
  brandSub: { fontFamily: "Times-Italic", fontSize: 10, color: C.stone, marginTop: 2 },
  certNo: { fontFamily: "Courier", fontSize: 10, color: C.forest },
  certNoLabel: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, textAlign: "right" },
  title: { fontFamily: "Times-Italic", fontSize: 17, marginTop: 22, marginBottom: 2 },
  verdictBox: { marginTop: 14, borderRadius: 6, padding: 14, borderWidth: 1 },
  verdictLabel: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  verdictPhrase: { fontSize: 10, color: C.stone, marginTop: 4, lineHeight: 1.5 },
  grid: { marginTop: 20, flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "50%", marginBottom: 12 },
  cellLabel: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  cellValue: { fontSize: 11 },
  mono: { fontFamily: "Courier", fontSize: 10 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 },
  coordLine: { fontFamily: "Courier", fontSize: 9, color: C.forest, marginBottom: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  chip: { fontSize: 8, color: C.stone, backgroundColor: C.ivoryDeep, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 7, marginRight: 5, marginBottom: 4 },
  traces: { marginTop: 18, backgroundColor: "#f0f7f1", borderRadius: 6, padding: 11, fontSize: 9, color: "#0d4f27" },
  footer: { position: "absolute", bottom: 30, left: 48, right: 48, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10 },
  footerText: { fontSize: 7.5, color: C.stoneLight, lineHeight: 1.5 },
});

export function CertificatDocument({ data, qrDataUrl }: { data: CertificatData; qrDataUrl?: string }) {
  const col = statutColor(data.statut);
  return (
    <Document title={`Certificat ${data.numeroCertificat}`} author="Agrivo">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Agrivo</Text>
            <Text style={styles.brandSub}>Évaluation de conformité RDUE</Text>
          </View>
          <View>
            <Text style={styles.certNoLabel}>N° de certificat</Text>
            <Text style={styles.certNo}>{data.numeroCertificat}</Text>
            <Text style={[styles.certNoLabel, { marginTop: 4 }]}>Émis le</Text>
            <Text style={{ fontSize: 9, color: C.stone, textAlign: "right" }}>{data.emisLe}</Text>
          </View>
        </View>

        <Text style={styles.title}>Certificat de vérification de parcelle</Text>

        <View style={[styles.verdictBox, { borderColor: col, backgroundColor: statutBg(data.statut) }]}>
          <Text style={[styles.verdictLabel, { color: col }]}>{data.statutLabel}</Text>
          <Text style={styles.verdictPhrase}>{data.phrase}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>Producteur</Text>
            <Text style={styles.cellValue}>{data.producteurNom}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>N° de carte producteur</Text>
            <Text style={[styles.cellValue, styles.mono]}>{data.numeroCartePro}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>Coopérative</Text>
            <Text style={styles.cellValue}>{data.cooperative}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>Filière</Text>
            <Text style={styles.cellValue}>{data.filiereLabel}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>Région</Text>
            <Text style={styles.cellValue}>{data.region}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>Superficie</Text>
            <Text style={[styles.cellValue, styles.mono]}>{data.superficie}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>Date pivot d&apos;analyse</Text>
            <Text style={[styles.cellValue, styles.mono]}>{data.datePivot}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>Centroïde (WGS-84)</Text>
            <Text style={[styles.cellValue, styles.mono]}>{data.centroid}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coordonnées de la parcelle · WGS-84, 6 décimales (RFC 7946)</Text>
          {data.vertices.map((v, i) => (
            <Text key={i} style={styles.coordLine}>
              {`P${i + 1}   ${v}`}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sources de données</Text>
          <View style={styles.chips}>
            {data.sources.map((s) => (
              <Text key={s} style={styles.chip}>
                {s}
              </Text>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 18, flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.traces, { flex: 1, marginTop: 0 }]}>
            Dossier prêt pour soumission sur TRACES NT (portail de l&apos;Union européenne). Traitement
            des données réalisé avec le consentement éclairé du producteur, conformément à la loi
            ivoirienne n°2013-450 (ARTCI).
          </Text>
          {qrDataUrl ? (
            <View style={{ marginLeft: 12, alignItems: "center", width: 76 }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, pas de DOM */}
              <Image src={qrDataUrl} style={{ width: 64, height: 64 }} />
              <Text style={{ fontSize: 6.5, color: C.stoneLight, marginTop: 3, textAlign: "center" }}>
                Scanner pour vérifier ce certificat
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Ce document est une évaluation technique produite par Agrivo à partir de données satellites
            publiques. Il ne se substitue pas à la responsabilité légale de l&apos;opérateur qui dépose la
            déclaration de diligence raisonnée. Agrivo · {data.numeroCertificat}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/** Génère le PDF et déclenche le téléchargement (appelé au clic, côté client uniquement). */
export async function telechargerCertificat(data: CertificatData): Promise<void> {
  // QR de vérification publique — si la génération échoue, le certificat part sans QR.
  const qrDataUrl = await QRCode.toDataURL(verificationUrl(data.numeroCertificat), {
    margin: 1,
    width: 256,
    color: { dark: "#0a1f14", light: "#ffffff" },
  }).catch(() => undefined);
  const blob = await pdf(<CertificatDocument data={data} qrDataUrl={qrDataUrl} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `certificat-agrivo-${data.numeroCertificat}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
