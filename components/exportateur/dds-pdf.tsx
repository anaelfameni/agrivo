"use client";

import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { type Expedition } from "@/data/mock-expeditions";
import { PARCELLES, type Parcelle } from "@/data/mock-parcelles";
import {
  construireDossierDds,
  rapportRisque,
  type DossierDds,
  type SectionRisque,
} from "@/lib/marketplace/dds-dossier";

/**
 * « Dossier de diligence raisonnée » au format PDF — le document que l'équipe conformité de
 * l'exportateur garde sous les yeux en reportant sa déclaration dans TRACES NT :
 *   page 1 = brouillon DDS (les champs factuels) + check-list de préparation ;
 *   page 2 = éléments réunis pour l'évaluation de risque (art. 9 et 10).
 * Module « lourd » (@react-pdf/renderer) : chargé UNIQUEMENT à la demande (import dynamique au
 * clic), jamais au SSR. Charte : « évaluation » jamais « garantie » ; AGRIVO prépare, l'opérateur
 * dépose (disclaimer DDS verbatim en pied de chaque page).
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

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 78, paddingHorizontal: 48, fontSize: 10, color: C.forest, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 14 },
  brand: { fontFamily: "Times-Bold", fontSize: 20, color: C.forest },
  brandSub: { fontFamily: "Times-Italic", fontSize: 10, color: C.stone, marginTop: 2 },
  refLabel: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, textAlign: "right" },
  ref: { fontFamily: "Courier", fontSize: 11, color: C.forest, textAlign: "right" },
  title: { fontFamily: "Times-Italic", fontSize: 16, marginTop: 20 },
  etat: { marginTop: 12, borderRadius: 6, padding: 12, borderWidth: 1 },
  etatLabel: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  grid: { marginTop: 16, flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "33.33%", marginBottom: 10 },
  cellLabel: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  cellValue: { fontSize: 10.5 },
  mono: { fontFamily: "Courier", fontSize: 9.5 },
  sectionTitle: { fontSize: 7, color: C.stoneLight, textTransform: "uppercase", letterSpacing: 1, marginTop: 14, marginBottom: 6 },
  check: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4.5 },
  checkPuce: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6, marginTop: 2 },
  checkTxt: { fontSize: 9, lineHeight: 1.5, flex: 1 },
  section: { marginTop: 10, borderBottomWidth: 0.5, borderBottomColor: C.line, paddingBottom: 9 },
  secTitre: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  secTexte: { fontSize: 9.5, color: C.stone, marginTop: 3, lineHeight: 1.55 },
  dds: { marginTop: 16, backgroundColor: C.ivoryDeep, borderRadius: 6, padding: 11, fontSize: 8.5, color: C.stone, lineHeight: 1.55 },
  footer: { position: "absolute", bottom: 28, left: 48, right: 48, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerText: { fontSize: 7.5, color: C.stoneLight, lineHeight: 1.5, maxWidth: 380 },
  qr: { width: 74, height: 74 },
});

function Footer({ dossier, lang, qrDataUrl }: { dossier: DossierDds; lang: "fr" | "en"; qrDataUrl?: string }) {
  const url = `https://agrivo-io.vercel.app/verifier-expedition?ref=${dossier.ref}`;
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {dossier.disclaimer[lang]} {lang === "en" ? `Public verification: ${url}` : `Vérification publique : ${url}`}
      </Text>
      {qrDataUrl ? <Image src={qrDataUrl} style={styles.qr} /> : null}
    </View>
  );
}

function DdsDocument({
  exp,
  dossier,
  sections,
  lang,
  qrDataUrl,
}: {
  exp: Expedition;
  dossier: DossierDds;
  sections: SectionRisque[];
  lang: "fr" | "en";
  qrDataUrl?: string;
}) {
  const en = lang === "en";
  const ok = dossier.verifications.filter((v) => v.ok).length;
  const total = dossier.verifications.length;
  const b = dossier.brouillon;
  return (
    <Document title={`Dossier DDS ${dossier.ref}`} author="Agrivo">
      {/* Page 1 : brouillon DDS + check-list de préparation */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Agrivo</Text>
            <Text style={styles.brandSub}>{en ? "Due diligence file (DDS draft, TRACES NT)" : "Dossier de diligence raisonnée (brouillon DDS, TRACES NT)"}</Text>
          </View>
          <View>
            <Text style={styles.refLabel}>{en ? "Internal reference" : "Référence interne"}</Text>
            <Text style={styles.ref}>{dossier.ref}</Text>
            <Text style={[styles.refLabel, { marginTop: 4 }]}>{en ? "Issued on" : "Émis le"}</Text>
            <Text style={{ fontSize: 9, color: C.stone, textAlign: "right" }}>
              {new Date().toLocaleDateString(en ? "en-GB" : "fr-FR", { dateStyle: "long" })}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{exp.nomLot}</Text>

        <View
          style={[
            styles.etat,
            dossier.pret
              ? { borderColor: C.green, backgroundColor: "#eaf6ee" }
              : { borderColor: C.amber, backgroundColor: "#faf3e4" },
          ]}
        >
          <Text style={[styles.etatLabel, { color: dossier.pret ? C.green : C.amber }]}>
            {en
              ? `Preparation: ${ok} of ${total} checks gathered${dossier.pret ? ", file ready to be reported in TRACES NT" : ""}`
              : `Préparation : ${ok} vérifications sur ${total} réunies${dossier.pret ? ", dossier prêt à reporter dans TRACES NT" : ""}`}
          </Text>
          {!dossier.pret && (
            <Text style={{ fontSize: 9, color: C.stone, marginTop: 3, lineHeight: 1.5 }}>
              {en
                ? "Items still missing are listed below: the file becomes downloadable once every check passes."
                : "Les éléments encore manquants sont listés ci-dessous : le dossier devient téléchargeable quand toutes les vérifications passent."}
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>{en ? "DDS draft (fields to report in TRACES NT)" : "Brouillon DDS (champs à reporter dans TRACES NT)"}</Text>
        <View style={styles.grid}>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Activity" : "Activité"}</Text>
            <Text style={styles.cellValue}>{b.activite[lang]}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Commodity · HS code" : "Denrée · code SH"}</Text>
            <Text style={styles.cellValue}>{b.denree[lang]} · {b.codeSH}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Net mass" : "Masse nette"}</Text>
            <Text style={[styles.cellValue, styles.mono]}>{b.masseNetteTonnes} t</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Country of production" : "Pays de production"}</Text>
            <Text style={styles.cellValue}>{b.paysProduction[lang]}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Geolocated plots" : "Parcelles géolocalisées"}</Text>
            <Text style={[styles.cellValue, styles.mono]}>{b.nbParcellesGeolocalisees} / {b.nbParcelles}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellLabel}>{en ? "Harvest period" : "Période de récolte"}</Text>
            <Text style={[styles.cellValue, styles.mono]}>{b.periodeRecolte}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.cellLabel}>{en ? "DDR references (reusable in the statement)" : "Références DDR (réutilisables dans la déclaration)"}</Text>
          <Text style={[styles.mono, { lineHeight: 1.6 }]}>{b.referencesDdr.length > 0 ? b.referencesDdr.join("  ·  ") : en ? "None recorded yet" : "Aucune enregistrée à ce stade"}</Text>
        </View>

        <Text style={styles.sectionTitle}>{en ? "Preparation checklist (recomputed from the file, never asserted)" : "Check-list de préparation (recalculée depuis le dossier, jamais affirmée)"}</Text>
        {dossier.verifications.map((v) => (
          <View key={v.code} style={styles.check}>
            <View style={[styles.checkPuce, { backgroundColor: v.ok ? C.green : C.amber }]} />
            <Text style={[styles.checkTxt, { color: v.ok ? C.forest : C.stone }]}>{v.detail[lang]}</Text>
          </View>
        ))}

        <View style={styles.dds}>
          <Text>
            {en
              ? "The attached GeoJSON (RFC 7946, WGS-84, 6 decimals) lists exactly the lot's plots of origin with their drawn tonnages, in the format expected for the geolocation attachment of the DDS."
              : "Le GeoJSON joint (RFC 7946, WGS-84, 6 décimales) liste exactement les parcelles d'origine du lot avec leurs tonnages prélevés, au format attendu pour la pièce de géolocalisation de la DDS."}
          </Text>
        </View>

        <Footer dossier={dossier} lang={lang} qrDataUrl={qrDataUrl} />
      </Page>

      {/* Page 2 : éléments réunis pour l'évaluation de risque de l'opérateur */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Agrivo</Text>
            <Text style={styles.brandSub}>
              {en
                ? "Elements gathered for the operator's risk assessment (art. 9 and 10)"
                : "Éléments réunis pour l'évaluation de risque de l'opérateur (art. 9 et 10)"}
            </Text>
          </View>
          <View>
            <Text style={styles.refLabel}>{en ? "Internal reference" : "Référence interne"}</Text>
            <Text style={styles.ref}>{dossier.ref}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 9, color: C.stone, marginTop: 14, lineHeight: 1.55 }}>
          {en
            ? "Each section states what the file contains. The risk assessment conclusion belongs to the operator filing the statement, under Regulation (EU) 2023/1115."
            : "Chaque section constate ce que le dossier contient. La conclusion de l'évaluation de risque appartient à l'opérateur qui dépose la déclaration, au sens du règlement (UE) 2023/1115."}
        </Text>

        {sections.map((s) => (
          <View key={s.code} style={styles.section}>
            <Text style={styles.secTitre}>{s.titre[lang]}</Text>
            <Text style={styles.secTexte}>{s.contenu[lang]}</Text>
          </View>
        ))}

        <Footer dossier={dossier} lang={lang} qrDataUrl={qrDataUrl} />
      </Page>
    </Document>
  );
}

/** Génère et télécharge le PDF du dossier DDS (appelé via import dynamique au clic). */
export async function telechargerDdsPdf(
  exp: Expedition,
  lang: "fr" | "en",
  toutesParcelles: Parcelle[] = PARCELLES,
): Promise<void> {
  const dossier = construireDossierDds(exp, toutesParcelles);
  const sections = rapportRisque(exp, toutesParcelles);
  let qrDataUrl: string | undefined;
  try {
    qrDataUrl = await QRCode.toDataURL(`https://agrivo-io.vercel.app/verifier-expedition?ref=${dossier.ref}`, {
      width: 220,
      margin: 1,
      color: { dark: "#0a1f14", light: "#ffffff" },
    });
  } catch {
    /* QR indisponible : le PDF part sans (jamais bloquant) */
  }
  const blob = await pdf(
    <DdsDocument exp={exp} dossier={dossier} sections={sections} lang={lang} qrDataUrl={qrDataUrl} />,
  ).toBlob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `agrivo-dossier-dds-${dossier.ref}.pdf`;
  a.click();
  URL.revokeObjectURL(a.href);
}
