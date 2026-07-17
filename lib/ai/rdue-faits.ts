/**
 * Base de faits RDUE curée et SOURCÉE — socle du Copilote de conformité (route
 * /api/gemini/rdue-qa). Tous les faits sont vérifiés (règlement (UE) 2023/1115,
 * amendement (UE) 2025/2650 de décembre 2025, benchmarking pays du 22 mai 2025).
 *
 * Charte : ces faits GROUNDENT la réponse de Gemini (il ne peut rien inventer) et servent
 * de repli déterministe si l'IA est indisponible. Aucun chiffre inventé, statuts figés,
 * « évaluation » jamais « garantie », ZÉRO vocabulaire de crédit/financement.
 */

export interface FaitRDUE {
  id: string;
  /** Mots-clés normalisés (sans accents, minuscules) pour l'appariement déterministe. */
  motsCles: string[];
  question: { fr: string; en: string };
  reponse: { fr: string; en: string };
  /** Citation courte de la source / date, affichée sous la réponse. */
  source: { fr: string; en: string };
}

export const FAITS_RDUE: FaitRDUE[] = [
  {
    id: "definition",
    motsCles: ["rdue", "eudr", "reglement", "cest quoi", "definition", "quest", "loi", "2023", "1115", "regulation"],
    question: { fr: "Qu'est-ce que le RDUE ?", en: "What is the EUDR?" },
    reponse: {
      fr: "Le RDUE, Règlement (UE) 2023/1115, interdit d'importer dans l'Union des produits issus de terres déforestées après le 31 décembre 2020. Il impose une traçabilité géolocalisée parcelle par parcelle et une déclaration de diligence raisonnée.",
      en: "The EUDR, Regulation (EU) 2023/1115, bans importing into the Union products grown on land deforested after 31 December 2020. It requires plot-by-plot geolocated traceability and a due diligence statement.",
    },
    source: { fr: "Règlement (UE) 2023/1115", en: "Regulation (EU) 2023/1115" },
  },
  {
    id: "echeances",
    motsCles: ["date", "echeance", "quand", "delai", "report", "reporte", "2026", "2027", "calendrier", "entree", "vigueur", "applicable", "deadline", "deadlines", "when", "postpone", "postponed", "delay", "timeline"],
    question: { fr: "Quelles sont les échéances ?", en: "What are the deadlines?" },
    reponse: {
      fr: "La révision (UE) 2025/2650 de décembre 2025 a confirmé le calendrier : 30 décembre 2026 pour les grands et moyens opérateurs, 30 juin 2027 pour les micro et petites entreprises. Le calendrier ne bouge plus.",
      en: "The (EU) 2025/2650 revision of December 2025 confirmed the timeline: 30 December 2026 for large and medium operators, 30 June 2027 for micro and small businesses. The timeline is now fixed.",
    },
    source: { fr: "Révision (UE) 2025/2650, décembre 2025", en: "Revision (EU) 2025/2650, December 2025" },
  },
  {
    id: "cote-ivoire",
    motsCles: ["cote", "ivoire", "ivoirienne", "risque", "standard", "faible", "eleve", "benchmarking", "classement", "concernee", "concerne", "ivory", "coast", "concerned", "classified"],
    question: { fr: "La Côte d'Ivoire est-elle concernée ?", en: "Is Côte d'Ivoire concerned?" },
    reponse: {
      fr: "Oui. Le benchmarking pays du 22 mai 2025 classe la Côte d'Ivoire en « risque standard ». La géolocalisation complète des parcelles y reste obligatoire : seuls les pays à « faible risque » ont une diligence simplifiée, et la Côte d'Ivoire n'en fait pas partie.",
      en: "Yes. The 22 May 2025 country benchmarking classifies Côte d'Ivoire as \"standard risk\". Full plot geolocation remains mandatory there: only \"low risk\" countries get simplified due diligence, and Côte d'Ivoire is not one of them.",
    },
    source: { fr: "Benchmarking pays, 22 mai 2025", en: "Country benchmarking, 22 May 2025" },
  },
  {
    id: "geolocalisation",
    motsCles: ["geolocalisation", "geolocaliser", "coordonnees", "gps", "polygone", "parcelle", "cartographier", "cartographie", "point", "geolocation", "geolocate", "coordinates", "polygon", "plot", "mapping"],
    question: { fr: "Que faut-il géolocaliser ?", en: "What must be geolocated?" },
    reponse: {
      fr: "Chaque parcelle de production doit être localisée : un polygone pour les parcelles de plus de 4 hectares, un point de coordonnées en dessous. C'est exactement ce que produit le mode terrain d'AGRIVO, au format GeoJSON (RFC 7946).",
      en: "Every production plot must be located: a polygon for plots over 4 hectares, a coordinate point below. That is exactly what AGRIVO's field mode produces, in GeoJSON format (RFC 7946).",
    },
    source: { fr: "Art. 9 du Règlement (UE) 2023/1115", en: "Art. 9 of Regulation (EU) 2023/1115" },
  },
  {
    id: "qui-declare",
    motsCles: ["qui declare", "qui depose", "declare", "declaration", "dds", "diligence", "traces", "depose", "operateur", "importateur", "signe", "responsable", "who", "file", "files", "statement", "operator", "importer"],
    question: { fr: "Qui dépose la déclaration ?", en: "Who files the declaration?" },
    reponse: {
      fr: "C'est l'opérateur qui met le produit sur le marché de l'Union (l'importateur européen) qui dépose la déclaration de diligence raisonnée sur TRACES NT. Depuis la simplification de 2025, seul le premier opérateur dépose la déclaration complète ; l'aval peut la référencer.",
      en: "It is the operator placing the product on the Union market (the European importer) who files the due diligence statement on TRACES NT. Since the 2025 simplification, only the first operator files the full statement; downstream operators can reference it.",
    },
    source: { fr: "Art. 4 & révision (UE) 2025/2650", en: "Art. 4 & revision (EU) 2025/2650" },
  },
  {
    id: "role-agrivo",
    motsCles: ["agrivo", "role", "fait", "certificat", "garantie", "responsabilite", "aide", "sert", "apporte", "certificate", "guarantee", "does"],
    question: { fr: "Que fait AGRIVO, exactement ?", en: "What exactly does AGRIVO do?" },
    reponse: {
      fr: "AGRIVO produit une évaluation technique de conformité et un certificat vérifiable qui alimentent la déclaration de l'opérateur. C'est une évaluation, jamais une garantie légale : la responsabilité réglementaire reste celle de l'opérateur qui met le produit sur le marché.",
      en: "AGRIVO produces a technical compliance assessment and a verifiable certificate that feed the operator's declaration. It is an assessment, never a legal guarantee: regulatory responsibility remains with the operator placing the product on the market.",
    },
    source: { fr: "Périmètre AGRIVO", en: "AGRIVO scope" },
  },
  {
    id: "produits",
    motsCles: ["produit", "filiere", "cacao", "cafe", "hevea", "caoutchouc", "palme", "soja", "bois", "bovin", "couvre", "commodity", "commodities", "cocoa", "coffee", "rubber", "covered"],
    question: { fr: "Quels produits sont couverts ?", en: "Which commodities are covered?" },
    reponse: {
      fr: "Le RDUE couvre sept matières premières : cacao, café, bois, caoutchouc (hévéa), huile de palme, soja et bovins, ainsi que leurs produits dérivés. AGRIVO cible en priorité le cacao, le café, l'hévéa et le palmier à huile.",
      en: "The EUDR covers seven commodities: cocoa, coffee, wood, rubber, palm oil, soy and cattle, plus their derived products. AGRIVO focuses first on cocoa, coffee, rubber and oil palm.",
    },
    source: { fr: "Annexe I du Règlement (UE) 2023/1115", en: "Annex I of Regulation (EU) 2023/1115" },
  },
  {
    id: "sanctions",
    motsCles: ["sanction", "amende", "penalite", "risque", "risques", "sanctions", "punition", "consequence", "non conformite", "penalty", "penalties", "fine", "fines"],
    question: { fr: "Que risque-t-on en cas de non-conformité ?", en: "What are the penalties for non-compliance?" },
    reponse: {
      fr: "Le règlement prévoit des amendes pouvant atteindre 4 % du chiffre d'affaires annuel réalisé dans l'Union, la confiscation des produits et l'exclusion temporaire des marchés publics. Concrètement, un lot non tracé peut être bloqué à l'entrée de l'Union.",
      en: "The regulation provides for fines of up to 4% of annual EU turnover, confiscation of products and temporary exclusion from public procurement. In practice, an untraced batch can be blocked at the Union border.",
    },
    source: { fr: "Art. 25 du Règlement (UE) 2023/1115", en: "Art. 25 of Regulation (EU) 2023/1115" },
  },
  {
    id: "petits-producteurs",
    motsCles: ["petit", "producteur", "planteur", "cooperative", "coop", "smallholder", "comment", "faire", "aider", "farmer", "comply", "how"],
    question: { fr: "Comment un petit producteur s'y conforme-t-il ?", en: "How does a smallholder comply?" },
    reponse: {
      fr: "Le petit producteur ne dépose rien lui-même : la charge documentaire remonte via sa coopérative et l'exportateur. AGRIVO outille la coopérative pour cartographier les parcelles, auditer le registre et produire les preuves, sans que le planteur ait à gérer la complexité réglementaire.",
      en: "A smallholder files nothing themselves: the documentary burden flows up through their cooperative and the exporter. AGRIVO equips the cooperative to map plots, audit the register and produce the evidence, without the farmer having to handle regulatory complexity.",
    },
    source: { fr: "Périmètre AGRIVO", en: "AGRIVO scope" },
  },
  {
    id: "cutoff",
    motsCles: ["2020", "decembre", "coupure", "cutoff", "avant", "apres", "ancienne", "plantation", "historique", "reference", "deforestation", "december"],
    question: { fr: "Quelle est la date de référence pour la déforestation ?", en: "What is the deforestation cut-off date?" },
    reponse: {
      fr: "La date de référence est le 31 décembre 2020. Une parcelle plantée sur une terre déjà défrichée avant cette date reste éligible ; une parcelle issue d'une déforestation postérieure ne l'est pas. AGRIVO évalue précisément ce critère par convergence de preuves satellites.",
      en: "The cut-off date is 31 December 2020. A plot on land already cleared before that date remains eligible; a plot from later deforestation is not. AGRIVO assesses this criterion precisely through satellite convergence of evidence.",
    },
    source: { fr: "Art. 2 du Règlement (UE) 2023/1115", en: "Art. 2 of Regulation (EU) 2023/1115" },
  },

  /* --------------------------- Faits RDUE enrichis (recherche vérifiée) --------------------------- */
  {
    id: "simplification",
    motsCles: ["simplification", "simplifie", "allege", "reduction", "paquet", "reference", "numero", "premier", "operateur", "aval", "downstream", "package", "simplified"],
    question: { fr: "Qu'a changé la simplification de 2026 ?", en: "What did the 2026 simplification change?" },
    reponse: {
      fr: "Le paquet de mai 2026 réduit d'environ 75 % les coûts de conformité sans toucher au fond. Seul le premier opérateur qui met le produit sur le marché de l'Union dépose la déclaration complète ; l'aval se contente d'en référencer le numéro. Les échéances ne bougent plus.",
      en: "The May 2026 package cuts compliance costs by about 75% without changing the substance. Only the first operator placing the product on the Union market files the full statement; downstream operators just reference its number. The deadlines no longer move.",
    },
    source: { fr: "Paquet de simplification RDUE, mai 2026", en: "EUDR simplification package, May 2026" },
  },
  {
    id: "ghana",
    motsCles: ["ghana", "voisin", "faible", "compare", "comparaison", "neighbour", "low"],
    question: { fr: "Pourquoi le Ghana est-il traité différemment ?", en: "Why is Ghana treated differently?" },
    reponse: {
      fr: "Le classement du 22 mai 2025 place le Ghana en « risque faible » alors que la Côte d'Ivoire est en « risque standard ». Un lot ivoirien subit donc une diligence complète, avec géolocalisation obligatoire, là où un lot ghanéen bénéficie d'une diligence simplifiée. D'où l'urgence d'outiller les coopératives ivoiriennes.",
      en: "The 22 May 2025 benchmarking places Ghana at \"low risk\" while Côte d'Ivoire is \"standard risk\". An Ivorian batch faces full due diligence with mandatory geolocation, whereas a Ghanaian batch gets simplified due diligence. Hence the urgency to equip Ivorian cooperatives.",
    },
    source: { fr: "Benchmarking pays, 22 mai 2025", en: "Country benchmarking, 22 May 2025" },
  },
  {
    id: "snt-carte",
    motsCles: ["snt", "le snt", "du snt", "systeme national", "tracabilite nationale", "carte du producteur", "carte producteur", "1er septembre", "septembre 2026", "enrolement", "enroles", "conseil cafe", "conseil du cafe", "ccc", "national traceability", "the nts", "producer card", "farmer card", "september"],
    question: { fr: "Que change le SNT et la carte du producteur au 1er septembre 2026 ?", en: "What do the NTS and the producer card change on 1 September 2026?" },
    reponse: {
      fr: "Dès le 1er septembre 2026, la carte du producteur et le Système national de traçabilité (Conseil du Café-Cacao) sont obligatoires pour toute transaction cacao : plus de 1,1 million de producteurs enrôlés, environ 900 000 cartes produites, environ 3 millions d'hectares géolocalisés, et plus de 160 000 tonnes déjà tracées du champ au navire pendant le pilote. Le SNT crée l'identité et la géolocalisation de base ; AGRIVO est la couche au-dessus : évaluation de non-déforestation par parcelle, sceau du lot, dossier acheteur et mise en marché. Le SNT identifie, AGRIVO rend vendable.",
      en: "From 1 September 2026, the producer card and the National Traceability System (Conseil du Café-Cacao) are mandatory for every cocoa transaction: over 1.1 million farmers enrolled, about 900,000 cards produced, about 3 million hectares geolocated, and over 160,000 tonnes already traced field-to-ship during the pilot. The NTS creates the base identity and geolocation; AGRIVO is the layer on top: per-plot deforestation assessment, lot seal, buyer file and market access. The NTS identifies, AGRIVO makes it sellable.",
    },
    source: { fr: "Conseil du Café-Cacao, annonce officielle du 12 juin 2026", en: "Conseil du Café-Cacao, official announcement, 12 June 2026" },
  },

  /* --------------------------- AGRIVO : produit, prix, parcours, site --------------------------- */
  {
    id: "agrivo-prix",
    motsCles: ["prix", "cout", "coute", "tarif", "tarifs", "abonnement", "combien", "cher", "payer", "mois", "fcfa", "price", "cost", "pricing", "subscription", "fee", "much"],
    question: { fr: "Combien coûte AGRIVO ?", en: "How much does AGRIVO cost?" },
    reponse: {
      fr: "L'abonnement coopérative est de 100 000 FCFA par mois, soit environ 1 200 FCFA par producteur vérifié et par an. Côté exportateur, deux offres : Essentiel à 500 000 FCFA par mois (portefeuille multi-coopératives, dossiers acheteurs, alertes) et Pro à 1 000 000 FCFA par mois (API REST, export en masse, TRACES NT, SLA). Le producteur ne paie rien : la vérification est prise en charge par sa coopérative.",
      en: "The cooperative subscription is 100,000 FCFA per month, about 1,200 FCFA per verified farmer per year. On the exporter side, two plans: Essential at 500,000 FCFA per month (multi-cooperative portfolio, buyer files, alerts) and Pro at 1,000,000 FCFA per month (REST API, batch export, TRACES NT, SLA). The farmer pays nothing: verification is covered by their cooperative.",
    },
    source: { fr: "Tarifs AGRIVO", en: "AGRIVO pricing" },
  },
  {
    id: "exportateur-prix",
    motsCles: ["essentiel", "exportateur essentiel", "exportateur pro", "offre", "offres", "palier", "paliers", "exportateur", "500 000", "1 000 000", "essential", "tier", "tiers", "offer", "offers", "plan"],
    question: { fr: "Que contiennent les offres exportateur ?", en: "What do the exporter plans include?" },
    reponse: {
      fr: "L'offre Exportateur Essentiel, à 500 000 FCFA par mois, couvre le pilotage du portefeuille multi-coopératives : tableau de bord, coopératives et producteurs consolidés, registre satellite, dossiers acheteurs et alertes. L'offre Exportateur Pro, à 1 000 000 FCFA par mois, ajoute l'API REST, l'export en masse, les déclarations TRACES NT intégrées, l'assistant IA de portefeuille et un engagement de disponibilité (SLA).",
      en: "The Exporter Essential plan, at 500,000 FCFA per month, covers multi-cooperative portfolio steering: dashboard, consolidated cooperatives and farmers, satellite register, buyer files and alerts. The Exporter Pro plan, at 1,000,000 FCFA per month, adds the REST API, batch export, built-in TRACES NT declarations, the portfolio AI assistant and an availability commitment (SLA).",
    },
    source: { fr: "Tarifs AGRIVO · offres exportateur", en: "AGRIVO pricing · exporter plans" },
  },
  {
    id: "agrivo-produit",
    motsCles: ["agrivo", "quoi", "sert", "plateforme", "outil", "comment marche", "fonctionne", "parcours", "etapes", "does", "what", "how", "works", "flow", "platform", "utiliser", "use"],
    question: { fr: "Comment fonctionne AGRIVO ?", en: "How does AGRIVO work?" },
    reponse: {
      fr: "AGRIVO déroule un parcours en plusieurs temps : import ou saisie des parcelles, cartographie, analyse satellite, verdict expliqué, certificat d'évaluation de conformité, puis valorisation. Le tout au format accepté par l'Union européenne et directement exploitable pour la déclaration sur TRACES NT.",
      en: "AGRIVO runs a step-by-step journey: import or enter plots, mapping, satellite analysis, an explained verdict, a compliance-assessment certificate, then valorisation. All in the format accepted by the European Union, ready for the TRACES NT declaration.",
    },
    source: { fr: "Parcours AGRIVO", en: "AGRIVO journey" },
  },
  {
    id: "agrivo-espaces",
    motsCles: ["espace", "espaces", "coop", "exportateur", "dashboard", "tableau", "bord", "difference", "deux", "workspace", "exporter", "spaces"],
    question: { fr: "Quels sont les deux espaces d'AGRIVO ?", en: "What are AGRIVO's two spaces?" },
    reponse: {
      fr: "AGRIVO a deux espaces distincts : l'espace coopérative, pour vérifier les parcelles de ses producteurs, et l'espace exportateur, pour piloter un portefeuille de plusieurs coopératives. Chaque compte atterrit directement sur son propre tableau de bord.",
      en: "AGRIVO has two distinct spaces: the cooperative workspace, to verify its farmers' plots, and the exporter workspace, to steer a portfolio of several cooperatives. Each account lands on its own dashboard.",
    },
    source: { fr: "Espaces AGRIVO", en: "AGRIVO workspaces" },
  },
  {
    id: "agrivo-valorisation",
    motsCles: ["valorisation", "prime", "primes", "acheteur", "acheteurs", "premium", "vendre", "revenu", "gagner", "rentable", "rapporte", "benefice", "premiums", "buyer", "income", "sell", "worth"],
    question: { fr: "En quoi la conformité rapporte-t-elle à la coopérative ?", en: "How does compliance pay off for the cooperative?" },
    reponse: {
      fr: "Une parcelle conforme ouvre l'accès aux primes de durabilité et aux acheteurs européens exigeants. Le prix bord champ est fixé chaque campagne par le Conseil du Café-Cacao (2 800 FCFA/kg pour la campagne principale 2025-26, 1 200 FCFA/kg pour la campagne intermédiaire) ; la conformité se valorise au-dessus de ce prix garanti. Ordre de grandeur : sur les contrats à terme, le cacao vérifié zéro déforestation se négocie 80 à 150 dollars la tonne au-dessus du standard.",
      en: "A compliant plot opens access to sustainability premiums and demanding European buyers. The farmgate price is set each season by the Coffee-Cocoa Council (2,800 FCFA/kg for the 2025-26 main crop, 1,200 FCFA/kg for the mid-crop); compliance is valorised above that guaranteed price. Order of magnitude: on forward contracts, verified deforestation-free cocoa trades 80 to 150 dollars per tonne above standard grade.",
    },
    source: { fr: "Conseil du Café-Cacao (prix de campagne) · presse sectorielle cacao, mai 2026 (primes)", en: "Coffee-Cocoa Council (season prices) · cocoa trade press, May 2026 (premiums)" },
  },
  {
    id: "agrivo-verdicts",
    motsCles: ["verdict", "verdicts", "statut", "statuts", "trois verdicts", "les trois", "signifient", "status", "result", "resultat"],
    question: { fr: "Que veulent dire les trois verdicts ?", en: "What do the three verdicts mean?" },
    reponse: {
      fr: "AGRIVO rend toujours l'un de trois verdicts : « Conforme » (aucune déforestation après le 31 décembre 2020), « Anomalie détectée » (perte de couvert forestier ou recouvrement d'une aire protégée), ou « Données insuffisantes » (nuages ou données satellites insuffisantes). Chaque verdict est expliqué en langage clair.",
      en: "AGRIVO always returns one of three verdicts: \"Compliant\" (no deforestation after 31 December 2020), \"Anomaly detected\" (forest cover loss or overlap with a protected area), or \"Insufficient data\" (clouds or insufficient satellite data). Each verdict is explained in plain language.",
    },
    source: { fr: "Méthodologie AGRIVO", en: "AGRIVO methodology" },
  },

  /* --------------------- Verdicts expliqués (causes réelles, jamais générique) --------------------- */
  {
    id: "verdict-insuffisant",
    motsCles: ["insuffisant", "insuffisantes", "donnees insuffisantes", "veut dire", "signifie", "ombrage", "nuage", "nuages", "ambre", "re-verifier", "reverifier", "insufficient", "insufficient data", "cloud", "clouds", "shade", "amber"],
    question: { fr: "Que veut dire exactement « Données insuffisantes » ?", en: "What exactly does \"Insufficient data\" mean?" },
    reponse: {
      fr: "Ce n'est ni un refus ni une anomalie : les preuves satellites ne permettent pas encore de statuer, et AGRIVO ne délivre jamais un « Conforme » par défaut. Les causes réelles : une cacaoyère sous ombrage vue comme de la forêt (le cas le plus fréquent), les nuages persistants de la saison des pluies, une parcelle très petite ou un tracé imprécis, ou des sources satellites en désaccord. La marche à suivre : relancer l'analyse en saison sèche depuis la file « À re-vérifier », repréciser le tracé sur le terrain, ou documenter l'âge de la plantation.",
      en: "It is neither a rejection nor an anomaly: the satellite evidence cannot yet decide, and AGRIVO never issues a default \"Compliant\". The real causes: a shade-grown cocoa farm seen as forest (the most frequent case), persistent rainy-season clouds, a very small plot or an imprecise outline, or disagreeing satellite sources. The way forward: re-run the analysis in the dry season from the \"To re-verify\" queue, refine the outline in the field, or document the plantation's age.",
    },
    source: { fr: "Méthodologie AGRIVO · convergence de preuves (FAO)", en: "AGRIVO methodology · convergence of evidence (FAO)" },
  },
  {
    id: "verdict-anomalie",
    motsCles: ["anomalie", "anomalie detectee", "detectee", "rouge", "perte de couvert", "que faire", "conteste", "contester", "recouvrement", "anomaly", "anomaly detected", "detected", "flagged", "red"],
    question: { fr: "Que faire après une « Anomalie détectée » ?", en: "What to do after an \"Anomaly detected\"?" },
    reponse: {
      fr: "« Anomalie détectée » signifie qu'une perte de couverture forestière après le 31 décembre 2020, ou un recouvrement d'aire protégée, a été identifiée. Ensuite : vérifiez le tracé de la parcelle (une erreur de saisie se corrige puis se réanalyse), activez le masque « Zones sensibles » sur la carte pour voir le recouvrement, et si l'anomalie se confirme, écartez cette seule parcelle du dossier export : le reste du portefeuille n'est pas pénalisé.",
      en: "\"Anomaly detected\" means a loss of forest cover after 31 December 2020, or an overlap with a protected area, was identified. Next: check the plot's outline (a data-entry error can be fixed then re-analysed), toggle the \"Sensitive areas\" mask on the map to see the overlap, and if the anomaly is confirmed, set aside this single plot from the export file: the rest of the portfolio is not penalised.",
    },
    source: { fr: "Méthodologie AGRIVO · verdicts", en: "AGRIVO methodology · verdicts" },
  },
  {
    id: "exportateur-cooperatives",
    motsCles: ["ajouter", "ajouter une cooperative", "cooperative", "cooperatives", "siege", "sieges", "reseau", "portefeuille", "partenaire", "registre partage", "add", "add a cooperative", "headquarters", "partner", "network"],
    question: { fr: "Comment ajouter une coopérative à mon portefeuille ?", en: "How do I add a cooperative to my portfolio?" },
    reponse: {
      fr: "Dans l'espace exportateur, page Coopératives, cliquez « Ajouter une coopérative » : renseignez les informations qu'elle vous a partagées (contact, siège, effectif, filières), puis importez si vous le détenez son registre de parcelles (GeoJSON, CSV ou KML). AGRIVO l'audite immédiatement selon la règle RDUE et affiche le pourcentage de parcelles prêtes. Sur la carte, chaque coopérative est représentée par le point de son siège, jamais par une superficie.",
      en: "In the exporter workspace, on the Cooperatives page, click \"Add a cooperative\": fill in the information it shared with you (contact, headquarters, headcount, commodities), then import its plot register if you hold it (GeoJSON, CSV or KML). AGRIVO audits it immediately against the EUDR rule and shows the percentage of ready plots. On the map, each cooperative is represented by its headquarters point, never by an area.",
    },
    source: { fr: "Espace exportateur · Coopératives", en: "Exporter workspace · Cooperatives" },
  },
  {
    id: "exportateur-rapports",
    motsCles: ["dossier", "dossiers", "acheteur", "acheteurs", "rapport", "rapports", "resume executif", "consolide", "client europeen", "buyer", "buyer file", "report", "reports", "executive"],
    question: { fr: "Qu'est-ce que le dossier acheteur ?", en: "What is the buyer file?" },
    reponse: {
      fr: "La page Dossiers & rapports de l'espace exportateur consolide vos parcelles conformes en un dossier destiné à l'acheteur européen : résumé exécutif rédigé par l'IA, certificats vérifiables par QR code et géométries GeoJSON au format attendu par TRACES NT. On y trouve aussi le centre d'alertes du portefeuille, groupé par coopérative.",
      en: "The Files & reports page of the exporter workspace consolidates your compliant plots into a file for the European buyer: an AI-written executive summary, QR-verifiable certificates and GeoJSON geometries in the format expected by TRACES NT. It also hosts the portfolio alert centre, grouped by cooperative.",
    },
    source: { fr: "Espace exportateur · Dossiers & rapports", en: "Exporter workspace · Files & reports" },
  },
  {
    id: "agrivo-equipe",
    motsCles: ["equipe", "qui est derriere", "derriere", "fondateur", "fondateurs", "createur", "createurs", "membres", "team", "behind", "founder", "founders", "who is behind"],
    question: { fr: "Qui est derrière AGRIVO ?", en: "Who is behind AGRIVO?" },
    reponse: {
      fr: "AGRIVO est porté par une équipe ivoirienne de quatre personnes : Anael (fondateur et chef de projet, produit et plateforme web), Christ (ingénieur application mobile), Gaddiel (ingénieur backend et API) et Domy (responsable conformité et réglementaire). L'équipe est présentée sur la page À propos.",
      en: "AGRIVO is built by an Ivorian team of four: Anael (founder and project lead, product and web platform), Christ (mobile app engineer), Gaddiel (backend and API engineer) and Domy (compliance and regulatory lead). The team is presented on the About page.",
    },
    source: { fr: "Page À propos", en: "About page" },
  },
  {
    id: "agrivo-masque",
    motsCles: ["masque", "zone", "zones", "sensible", "sensibles", "aire", "protegee", "protegees", "foret", "classee", "carte", "rouge", "mask", "protected", "area", "map"],
    question: { fr: "À quoi sert le masque des zones sensibles ?", en: "What is the sensitive-areas mask for?" },
    reponse: {
      fr: "Le masque affiche les aires protégées et forêts classées de Côte d'Ivoire (tracés indicatifs, sources publiques). Une parcelle qui les recoupe est signalée en anomalie : c'est un enjeu réel, car 30 à 40 % du cacao ivoirien provient de terres protégées. Un bouton l'active sur toutes les cartes.",
      en: "The mask shows Côte d'Ivoire's protected areas and classified forests (indicative outlines, public sources). A plot overlapping them is flagged as an anomaly: a real issue, since 30 to 40% of Ivorian cocoa comes from protected land. A button toggles it on every map.",
    },
    source: { fr: "Nature Food 2023 ; WDPA", en: "Nature Food 2023; WDPA" },
  },
  {
    id: "agrivo-compte",
    motsCles: ["compte", "inscription", "inscrire", "creer", "creation", "connexion", "connecter", "demo", "essayer", "account", "sign", "register", "login", "create", "try"],
    question: { fr: "Comment créer un compte ou essayer AGRIVO ?", en: "How do I create an account or try AGRIVO?" },
    reponse: {
      fr: "Sur la page d'inscription, choisissez votre profil (coopérative ou exportateur) puis renseignez vos informations. Pour essayer sans compte, la page de connexion propose deux démonstrations en un clic : « Démo Coopérative » et « Démo Exportateur ».",
      en: "On the sign-up page, choose your profile (cooperative or exporter) then fill in your details. To try without an account, the sign-in page offers two one-click demos: \"Cooperative demo\" and \"Exporter demo\".",
    },
    source: { fr: "Inscription AGRIVO", en: "AGRIVO sign-up" },
  },
  {
    id: "agrivo-verification",
    motsCles: ["verifier", "verification", "analyser", "lancer", "nouvelle", "sommet", "sommets", "coordonnees", "cartographier", "verify", "analyse", "run", "vertices", "coordinates"],
    question: { fr: "Comment lancer la vérification d'une parcelle ?", en: "How do I run a plot verification?" },
    reponse: {
      fr: "Depuis le tableau de bord coopérative, cliquez sur « Nouvelle vérification », recueillez le consentement, saisissez les coordonnées de la parcelle (au minimum 4 sommets) ou chargez un exemple, puis lancez l'analyse. AGRIVO calcule la superficie, rend le verdict et génère le certificat.",
      en: "From the cooperative dashboard, click \"New verification\", collect consent, enter the plot's coordinates (at least 4 vertices) or load an example, then run the analysis. AGRIVO computes the area, returns the verdict and generates the certificate.",
    },
    source: { fr: "Parcours de vérification AGRIVO", en: "AGRIVO verification journey" },
  },
  {
    id: "agrivo-certificat",
    motsCles: ["certificat", "pdf", "telecharger", "document", "qr", "certificate", "download", "proof", "preuve"],
    question: { fr: "Comment obtenir le certificat d'une parcelle ?", en: "How do I get a plot's certificate?" },
    reponse: {
      fr: "À la fin de la vérification, l'écran certificat propose un PDF horodaté portant un QR code. En scannant ce QR, n'importe quel acheteur ouvre la page de vérification publique et confirme l'évaluation. Le certificat ne remplace pas la déclaration de l'exportateur, seul responsable.",
      en: "At the end of the verification, the certificate screen offers a timestamped PDF carrying a QR code. Scanning it opens the public verification page and confirms the assessment. The certificate does not replace the exporter's declaration; the exporter remains solely responsible.",
    },
    source: { fr: "Certificat AGRIVO", en: "AGRIVO certificate" },
  },
  {
    id: "assistant-presentation",
    motsCles: ["bonjour", "salut", "hello", "qui es", "presente", "presenter", "ton nom", "tu fais quoi", "who are", "your name", "introduce", "greet"],
    question: { fr: "Qui es-tu ?", en: "Who are you?" },
    reponse: {
      fr: "Bonjour ! Je suis l'Assistant AGRIVO. Je connais toute la plateforme (prix, parcours de vérification, verdicts, certificats, espaces coopérative et exportateur) et le règlement européen contre la déforestation. Posez-moi votre question, je vous guide pas à pas ; et pour une demande complexe, notre équipe répond à support@agrivo.ci.",
      en: "Hello! I am the AGRIVO Assistant. I know the whole platform (pricing, verification journey, verdicts, certificates, cooperative and exporter workspaces) and the EU Deforestation Regulation. Ask me your question and I will guide you step by step; for complex requests, our team answers at support@agrivo.ci.",
    },
    source: { fr: "Assistant AGRIVO", en: "AGRIVO Assistant" },
  },
  {
    id: "agrivo-support",
    motsCles: ["support", "contacter", "email", "mail", "joindre", "ecrire", "probleme", "bug", "erreur", "assistance", "reclamation", "humain", "equipe", "help", "issue", "team"],
    question: { fr: "Comment contacter le support ?", en: "How do I contact support?" },
    reponse: {
      fr: "Pour toute demande complexe ou spécifique à votre dossier, écrivez à support@agrivo.ci : l'équipe répond sous 48 h ouvrées. Vous pouvez aussi passer par le formulaire de la page Contact ou consulter le Centre d'aide et la FAQ du site.",
      en: "For any complex or account-specific request, write to support@agrivo.ci: the team replies within 48 business hours. You can also use the Contact page form or browse the site's Help centre and FAQ.",
    },
    source: { fr: "Support AGRIVO", en: "AGRIVO support" },
  },
  {
    id: "agrivo-methodologie",
    motsCles: ["methodologie", "methode", "satellite", "satellites", "copernicus", "sentinel", "convergence", "preuve", "preuves", "fiable", "fiabilite", "precision", "boite noire", "fonctionne comment", "analyse comment", "method", "reliable", "accuracy", "evidence"],
    question: { fr: "Sur quoi repose l'analyse d'AGRIVO ?", en: "What is AGRIVO's analysis based on?" },
    reponse: {
      fr: "L'analyse croise plusieurs sources satellites publiques indépendantes (dont Copernicus, le programme européen d'observation de la Terre) autour de la date pivot du 31 décembre 2020 : c'est la convergence de preuves, la méthode de référence de la FAO. Aucune boîte noire : chaque verdict est expliqué en langage clair, avec ses sources.",
      en: "The analysis crosses several independent public satellite sources (including Copernicus, the European Earth-observation programme) around the 31 December 2020 cut-off date: convergence of evidence, the FAO reference method. No black box: every verdict is explained in plain language, with its sources.",
    },
    source: { fr: "Méthodologie AGRIVO (page Méthodologie)", en: "AGRIVO methodology (Methodology page)" },
  },
  {
    id: "agrivo-donnees",
    motsCles: ["donnees", "consentement", "artci", "propriete", "confidentialite", "rgpd", "protection", "vie privee", "securite", "cle", "data", "privacy", "consent", "ownership"],
    question: { fr: "À qui appartiennent les données ?", en: "Who owns the data?" },
    reponse: {
      fr: "Les données restent la propriété de la coopérative. Chaque vérification commence par le recueil du consentement éclairé du producteur (loi n°2013-450, ARTCI), et les clés d'accès aux services restent côté serveur : elles ne transitent jamais par le navigateur. Le détail est dans la page Confidentialité.",
      en: "The data remains the cooperative's property. Every verification starts with the farmer's informed consent (law no. 2013-450, ARTCI), and service access keys stay server-side: they never pass through the browser. Details are on the Privacy page.",
    },
    source: { fr: "Confidentialité AGRIVO · ARTCI", en: "AGRIVO privacy · ARTCI" },
  },
  {
    id: "agrivo-horsconnexion",
    motsCles: ["hors connexion", "hors-connexion", "offline", "reseau", "internet", "sans internet", "sans reseau", "marche sans", "coupure", "connexion", "brousse", "synchronisation", "sync", "network"],
    question: { fr: "AGRIVO marche-t-il sans réseau ?", en: "Does AGRIVO work without a network?" },
    reponse: {
      fr: "Oui. AGRIVO est une application installable qui garde un mode hors connexion : le contrôle avance au bord du champ même sans réseau, et la synchronisation suit dès que la connexion revient. Aucune étape de la vérification n'est bloquée par une coupure.",
      en: "Yes. AGRIVO is an installable app with an offline mode: the check moves forward at the edge of the field even without a network, and syncing follows as soon as the connection returns. No verification step is blocked by an outage.",
    },
    source: { fr: "Mode hors connexion AGRIVO", en: "AGRIVO offline mode" },
  },
  {
    id: "agrivo-langues",
    motsCles: ["langue", "langues", "anglais", "francais", "english", "voix", "vocal", "vocale", "lire", "ecouter", "language", "voice", "aloud"],
    question: { fr: "Quelles langues parle AGRIVO ?", en: "Which languages does AGRIVO speak?" },
    reponse: {
      fr: "L'interface est bilingue : français et anglais, avec un sélecteur en haut de page. Au moment du verdict, une lecture à voix haute permet d'expliquer simplement le résultat au producteur, au bord du champ.",
      en: "The interface is bilingual: French and English, with a switcher at the top of the page. At verdict time, a read-aloud feature helps explain the result plainly to the farmer, at the edge of the field.",
    },
    source: { fr: "Interface AGRIVO", en: "AGRIVO interface" },
  },
  {
    id: "agrivo-verifpublique",
    motsCles: ["qr", "scanner le", "verifier un certificat", "verification publique", "acheteur verifie", "authentique", "authenticite", "public", "verify a certificate", "authenticity", "buyer"],
    question: { fr: "Comment un acheteur vérifie-t-il un certificat ?", en: "How does a buyer verify a certificate?" },
    reponse: {
      fr: "Chaque certificat AGRIVO porte un QR code : en le scannant, n'importe quel acheteur ouvre la page publique « Vérifier un certificat » et confirme en direct le verdict, le producteur et la date d'évaluation. Aucun compte n'est nécessaire pour vérifier.",
      en: "Every AGRIVO certificate carries a QR code: by scanning it, any buyer opens the public \"Verify a certificate\" page and confirms the verdict, farmer and assessment date live. No account is needed to verify.",
    },
    source: { fr: "Vérification publique AGRIVO", en: "AGRIVO public verification" },
  },
  {
    id: "guide-tour",
    motsCles: ["guide", "tutoriel", "tuto", "interactif", "relancer", "demarrer", "commencer", "premiers pas", "decouvrir", "visite", "tour", "onboarding", "getting started"],
    question: { fr: "Comment relancer le guide interactif ?", en: "How do I relaunch the interactive guide?" },
    reponse: {
      fr: "Cliquez sur le bouton « ? » en haut de votre espace : le guide interactif se relance et vous fait visiter pas à pas votre tableau de bord, la vérification d'une parcelle, les verdicts et le certificat. Il s'ouvre aussi automatiquement à votre première connexion.",
      en: "Click the \"?\" button at the top of your workspace: the interactive guide relaunches and walks you step by step through your dashboard, plot verification, verdicts and the certificate. It also opens automatically on your first sign-in.",
    },
    source: { fr: "Guide interactif AGRIVO", en: "AGRIVO interactive guide" },
  },
  {
    id: "guide-import",
    motsCles: ["importer", "import", "registre", "auditer", "audit", "fichier", "charger", "geojson", "csv", "kml", "exporter", "export", "upload", "register", "file"],
    question: { fr: "Comment importer ou exporter mon registre de parcelles ?", en: "How do I import or export my plot register?" },
    reponse: {
      fr: "Depuis le tableau de bord coopérative, la carte « Auditer mon registre » accepte vos fichiers GeoJSON, CSV ou KML : AGRIVO calcule le pourcentage de parcelles prêtes pour le RDUE et liste les anomalies à corriger. Le bouton « Exporter (GeoJSON) » télécharge à l'inverse votre registre au format accepté par TRACES NT.",
      en: "From the cooperative dashboard, the \"Audit my register\" card accepts your GeoJSON, CSV or KML files: AGRIVO computes the share of EUDR-ready plots and lists the anomalies to fix. Conversely, the \"Export (GeoJSON)\" button downloads your register in the TRACES NT-accepted format.",
    },
    source: { fr: "Audit de registre AGRIVO", en: "AGRIVO register audit" },
  },
  {
    id: "guide-producteurs",
    motsCles: ["producteur", "producteurs", "ajouter", "ajouter un producteur", "nouveau producteur", "enregistrer", "fiche", "planteurs", "liste des", "add a farmer", "farmers"],
    question: { fr: "Comment ajouter un producteur ?", en: "How do I add a farmer?" },
    reponse: {
      fr: "Ouvrez la page « Producteurs » dans le menu latéral de votre espace coopérative, puis cliquez sur « Ajouter un producteur » : nom, matricule et, si vous les avez, les coordonnées de sa parcelle. Sa fiche devient ensuite cliquable et vous pouvez lancer sa vérification à tout moment.",
      en: "Open the \"Producers\" page in your cooperative workspace's side menu, then click \"Add a producer\": name, ID number and, if you have them, the plot's coordinates. Their record then becomes clickable and you can start their verification at any time.",
    },
    source: { fr: "Page Producteurs AGRIVO", en: "AGRIVO Producers page" },
  },
  {
    id: "guide-parametres",
    motsCles: ["parametres", "parametre", "mot de passe", "password", "profil", "organisation", "modifier", "changer", "securite", "settings", "deconnecter", "deconnexion", "logout"],
    question: { fr: "Où modifier mon profil ou mon mot de passe ?", en: "Where do I edit my profile or password?" },
    reponse: {
      fr: "Dans la page « Paramètres » de votre espace : l'onglet Profil pour vos informations, Organisation pour la coopérative, et Sécurité pour changer votre mot de passe. Le sélecteur de langue est en haut de page, et le bouton de déconnexion se trouve dans l'en-tête, à côté de votre nom.",
      en: "In your workspace's \"Settings\" page: the Profile tab for your details, Organisation for the cooperative, and Security to change your password. The language switcher is at the top of the page, and the sign-out button sits in the header, next to your name.",
    },
    source: { fr: "Paramètres AGRIVO", en: "AGRIVO settings" },
  },
  {
    id: "agrivo-alertes",
    motsCles: ["alerte", "alertes", "notification", "surveiller", "signale", "alert", "alerts", "watch", "centre"],
    question: { fr: "Où voir les alertes de la coopérative ?", en: "Where can I see the cooperative's alerts?" },
    reponse: {
      fr: "Le tableau de bord coopérative affiche un centre d'alertes qui regroupe les parcelles en anomalie ; chaque alerte mène directement à la fiche de la parcelle concernée. La répartition des trois statuts donne la santé globale du portefeuille.",
      en: "The cooperative dashboard shows an alert centre grouping plots with anomalies; each alert leads straight to the relevant plot's record. The three-status breakdown gives the portfolio's overall health.",
    },
    source: { fr: "Tableau de bord AGRIVO", en: "AGRIVO dashboard" },
  },
];

/** Questions d'amorce proposées dans le widget (les plus fréquentes en démo). */
export const QUESTIONS_SUGGEREES: { fr: string; en: string }[] = [
  { fr: "Combien coûte AGRIVO ?", en: "How much does AGRIVO cost?" },
  { fr: "La Côte d'Ivoire est-elle concernée ?", en: "Is Côte d'Ivoire concerned?" },
  { fr: "Comment lancer une vérification ?", en: "How do I run a verification?" },
  { fr: "Que veut dire « Anomalie détectée » ?", en: "What does \"Anomaly detected\" mean?" },
];

/** Réponse charte quand la question glisse vers le crédit / financement (frontière Nanti). */
export const HORS_PERIMETRE_FINANCE = {
  fr: "AGRIVO ne propose aucun crédit, prêt ni financement : ce n'est pas notre métier. Nous valorisons la conformité par les primes de durabilité et l'accès aux acheteurs premium. Pour la conformité RDUE elle-même, je peux tout vous expliquer.",
  en: "AGRIVO offers no credit, loan or financing: that is not our business. We valorise compliance through sustainability premiums and access to premium buyers. On EUDR compliance itself, I can explain everything.",
};

/** Réponse de repli quand aucune correspondance nette n'est trouvée (et l'IA n'a rien renvoyé). */
export const HORS_SUJET = {
  fr: "Je réponds à vos questions sur AGRIVO (prix, parcours de vérification, verdicts, comptes, valorisation) et sur le règlement européen contre la déforestation (RDUE). Reformulez votre question et j'y réponds précisément ; pour une demande complexe, notre équipe répond à support@agrivo.ci.",
  en: "I answer your questions about AGRIVO (pricing, verification journey, verdicts, accounts, valorisation) and about the EU Deforestation Regulation (EUDR). Rephrase your question and I will answer precisely; for complex requests, our team answers at support@agrivo.ci.",
};

const MOTS_FINANCE = ["credit", "pret", "prete", "financement", "financer", "emprunt", "microcredit", "prefinancement", "dette", "avance", "tresorerie", "plafond", "solvabilite"];

function normaliser(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    // Retire les accents (marques combinantes U+0300–U+036F) SANS insérer d'espace,
    // sinon « crédit » deviendrait « cre dit » et casserait l'appariement.
    .replace(/[̀-ͯ]/g, "")
    // Puis la ponctuation devient un espace.
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface ReponseDeterministe {
  reponse: string;
  source: string | null;
  /** true si la question sortait du périmètre (finance ou aucun match net). */
  horsPerimetre: boolean;
  /** true UNIQUEMENT pour une question de crédit/financement (frontière Nanti) : réponse figée, aucun appel IA. */
  finance: boolean;
  faitId: string | null;
}

/**
 * Répond de façon 100 % déterministe (aucun appel réseau) en appariant la question
 * aux faits curés. Sert de repli quand Gemini est indisponible, et de source de
 * vérité que le prompt live ne peut pas contredire.
 */
export function repondreDeterministe(question: string, lang: "fr" | "en"): ReponseDeterministe {
  const q = normaliser(question);
  const mots = q.split(" ").filter((m) => m.length > 2);

  // Garde-fou charte : toute dérive vers le financement est renvoyée à la frontière Nanti.
  if (MOTS_FINANCE.some((f) => q.includes(f))) {
    return { reponse: HORS_PERIMETRE_FINANCE[lang], source: null, horsPerimetre: true, finance: true, faitId: null };
  }

  const qPad = ` ${q} `;
  let meilleur: { fait: FaitRDUE; score: number } | null = null;
  for (const fait of FAITS_RDUE) {
    let score = 0;
    for (const mc of fait.motsCles) {
      // Les mots-clés très courts (« dds », « qr »…) ne matchent qu'en MOT ENTIER :
      // en sous-chaîne, ils fuiraient dans des mots quelconques et pollueraient l'appariement.
      if (mc.length <= 3) {
        if (qPad.includes(` ${mc} `)) score += 1;
      } else if (q.includes(mc)) {
        score += mc.length > 4 ? 2 : 1;
      }
    }
    // Bonus : recoupement avec les mots de la question (robustesse aux formulations),
    // restreint aux mots-clés significatifs (≥ 4 caractères) ou à l'égalité stricte.
    for (const m of mots) {
      if (fait.motsCles.some((mc) => mc === m || (mc.length >= 4 && (mc.includes(m) || m.includes(mc))))) score += 1;
    }
    if (!meilleur || score > meilleur.score) meilleur = { fait, score };
  }

  if (!meilleur || meilleur.score < 2) {
    return { reponse: HORS_SUJET[lang], source: null, horsPerimetre: true, finance: false, faitId: null };
  }
  return {
    reponse: meilleur.fait.reponse[lang],
    source: meilleur.fait.source[lang],
    horsPerimetre: false,
    finance: false,
    faitId: meilleur.fait.id,
  };
}

/* --------------------------- Small-talk déterministe --------------------------- */

const SMALL_TALK: { marqueurs: string[]; reponse: { fr: string; en: string } }[] = [
  {
    // Remerciements / approbations — testés AVANT les saluts (« merci bonne journée »).
    marqueurs: ["merci", "thank", "thanks", "super", "parfait", "genial", "top", "d accord", "daccord", "ok", "compris", "note"],
    reponse: {
      fr: "Avec plaisir ! N'hésitez pas si vous avez une autre question : prix, vérification d'une parcelle, certificats, RDUE… je suis là pour ça. Et pour une demande complexe : support@agrivo.ci.",
      en: "You're welcome! Feel free to ask anything else: pricing, plot verification, certificates, EUDR… that's what I'm here for. For complex requests: support@agrivo.ci.",
    },
  },
  {
    marqueurs: ["au revoir", "a bientot", "bonne journee", "bonne soiree", "bye", "goodbye", "a plus", "ciao"],
    reponse: {
      fr: "Au revoir, et à bientôt sur AGRIVO ! Je reste disponible à tout moment depuis cette bulle, et notre équipe répond à support@agrivo.ci.",
      en: "Goodbye, and see you soon on AGRIVO! I remain available anytime from this bubble, and our team answers at support@agrivo.ci.",
    },
  },
  {
    marqueurs: ["ca va", "comment vas", "comment allez", "tu vas bien", "vous allez bien", "how are you", "la forme"],
    reponse: {
      fr: "Très bien, merci ! Je suis l'Assistant AGRIVO, toujours là pour vous aider : posez-moi une question sur la plateforme (prix, vérification, certificats) ou sur le règlement européen contre la déforestation.",
      en: "Very well, thank you! I'm the AGRIVO Assistant, always ready to help: ask me about the platform (pricing, verification, certificates) or the EU Deforestation Regulation.",
    },
  },
  {
    marqueurs: ["bonjour", "bonsoir", "salut", "coucou", "hello", "hey", "bjr", "slt", "good morning", "good evening"],
    reponse: {
      fr: "Bonjour ! Je suis l'Assistant AGRIVO. Je connais toute la plateforme et le règlement européen contre la déforestation. Posez-moi votre question, je vous guide pas à pas ; pour une demande complexe, notre équipe répond à support@agrivo.ci.",
      en: "Hello! I'm the AGRIVO Assistant. I know the whole platform and the EU Deforestation Regulation. Ask me your question and I'll guide you step by step; for complex requests, our team answers at support@agrivo.ci.",
    },
  },
];

/**
 * Détecte un message de pur small-talk (salut, merci, au revoir, « ça va ? ») et renvoie une
 * réponse chaleureuse INSTANTANÉE (aucun appel réseau, aucun quota consommé). Ne se déclenche
 * que si le message, une fois les marqueurs retirés, ne contient plus de vraie question :
 * « bonjour, comment créer un compte ? » passe donc au circuit normal.
 */
export function detecterSmallTalk(question: string, lang: "fr" | "en"): { reponse: string } | null {
  const q = normaliser(question);
  if (!q || q.length > 60) return null;
  const touche = SMALL_TALK.find((st) => st.marqueurs.some((m) => q.includes(m)));
  if (!touche) return null;
  // Retire TOUS les marqueurs small-talk (toutes catégories) puis regarde ce qui reste.
  let reste = q;
  for (const st of SMALL_TALK) for (const m of st.marqueurs) reste = reste.split(m).join(" ");
  const restants = reste.split(" ").filter(
    (w) =>
      w.length > 2 &&
      !["assistant", "agrivo", "monsieur", "madame", "bien", "toi", "vous", "moi", "beaucoup", "tres", "encore", "infiniment", "much", "very"].includes(w),
  );
  if (restants.length > 0) return null;
  return { reponse: touche.reponse[lang] };
}

/** Bloc de faits injecté dans le prompt live pour grounder Gemini (il ne peut rien ajouter). */
export function faitsPourPrompt(lang: "fr" | "en"): string {
  return FAITS_RDUE.map(
    (f) => `- [${f.id}] ${f.question[lang]} → ${f.reponse[lang]} (source : ${f.source[lang]})`,
  ).join("\n");
}
