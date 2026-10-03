export type DsfMode = "normal" | "smt";
export type LineKind = "asset" | "liability" | "income" | "expense" | "receipt" | "payment";
export type Severity = "error" | "warning" | "success";

export interface CompanyProfile {
  name: string;
  taxpayerId: string;
  tradeRegister: string;
  taxCenter: string;
  city: string;
  activity: string;
  fiscalYear: string;
  previousFiscalYear: string;
  openingCash: number;
  closingCash: number;
}

export interface DsfLine {
  id: string;
  kind: LineKind;
  code: string;
  section: string;
  label: string;
  reference: string;
  current: number;
  previous: number;
  date: string;
}

export interface DsfDeclaration {
  mode: DsfMode;
  profile: CompanyProfile;
  lines: DsfLine[];
  updatedAt: string;
}

export interface DsfSummary {
  assets: number;
  liabilities: number;
  revenue: number;
  expenses: number;
  receipts: number;
  payments: number;
  netIncome: number;
  /** Résultat saisi au passif (ligne CJ), ou null si aucune ligne CJ : le résultat calculé est alors ajouté au passif. */
  balanceSheetResult: number | null;
  /** Total passif, résultat de l'exercice compris une seule fois. */
  totalLiabilities: number;
  balanceGap: number;
  expectedClosingCash: number;
  cashGap: number;
}

export interface ValidationIssue {
  severity: Severity;
  message: string;
}

export interface CsvImport {
  lines: DsfLine[];
  issues: ValidationIssue[];
}

export const modeLabels: Record<DsfMode, string> = {
  normal: "DSF normale",
  smt: "DSF SMT",
};

export const kindLabels: Record<LineKind, string> = {
  asset: "Actif",
  liability: "Passif",
  income: "Produit",
  expense: "Charge",
  receipt: "Recette encaissée",
  payment: "Dépense payée",
};

export const sections: Record<LineKind, string[]> = {
  asset: ["Actif immobilisé", "Stocks", "Créances", "Trésorerie-actif"],
  liability: ["Capitaux propres", "Dettes financières", "Dettes circulantes", "Trésorerie-passif"],
  income: ["Produits d'exploitation", "Produits financiers", "Produits HAO"],
  expense: ["Achats", "Services extérieurs", "Personnel et impôts", "Charges financières", "Charges HAO"],
  receipt: ["Ventes encaissées", "Prestations encaissées", "Autres encaissements"],
  payment: ["Achats payés", "Charges payées", "Impôts payés", "Autres décaissements"],
};

/** Code SYSCOHADA de la ligne « Résultat net de l'exercice » au passif du bilan (bénéfice + ou perte -). */
export const resultCode = "CJ";

const kindAliases: Record<DsfMode, Partial<Record<LineKind, string[]>>> = {
  normal: {
    asset: ["asset", "actif"],
    liability: ["liability", "passif"],
    income: ["income", "produit", "produits"],
    expense: ["expense", "charge", "charges"],
  },
  smt: {
    receipt: ["receipt", "income", "recette", "recettes", "encaissement", "encaissements"],
    payment: ["payment", "expense", "depense", "depenses", "paiement", "paiements", "decaissement", "decaissements"],
  },
};

const expectedKinds: Record<DsfMode, string> = {
  normal: "actif, passif, produit ou charge",
  smt: "recette ou dépense",
};

const currentYear = new Date().getFullYear();
const encoder = new TextEncoder();

type WorkbookSheet = { name: string; rows: (string | number)[][] };

export const createDeclaration = (mode: DsfMode): DsfDeclaration => ({
  mode,
  profile: {
    name: "",
    taxpayerId: "",
    tradeRegister: "",
    taxCenter: "",
    city: "",
    activity: "",
    fiscalYear: String(currentYear - 1),
    previousFiscalYear: String(currentYear - 2),
    openingCash: 0,
    closingCash: 0,
  },
  lines: mode === "normal"
    ? [
        createLine("asset", "AI", "Immobilisations corporelles"),
        createLine("liability", "CA", "Capital"),
        createLine("income", "TA", "Ventes"),
        createLine("expense", "RA", "Achats"),
      ]
    : [createLine("receipt", "", "Encaissement client"), createLine("payment", "", "Paiement fournisseur")],
  updatedAt: new Date().toISOString(),
});

export const createLine = (kind: LineKind, code = "", label = ""): DsfLine => ({
  id: createId(),
  kind,
  code,
  section: sections[kind][0],
  label,
  reference: "",
  current: 0,
  previous: 0,
  date: `${currentYear - 1}-12-31`,
});

export const normalizeDeclaration = (declaration: DsfDeclaration): DsfDeclaration => ({
  ...declaration,
  profile: {
    ...declaration.profile,
    taxpayerId: declaration.profile.taxpayerId.trim().toUpperCase(),
    openingCash: safeAmount(declaration.profile.openingCash),
    closingCash: safeAmount(declaration.profile.closingCash),
  },
  lines: declaration.lines.map((line) => ({
    ...line,
    id: line.id || createId(),
    code: line.code.trim().toUpperCase(),
    // Une section inconnue est conservée telle quelle pour que validateDeclaration la signale.
    section: findSection(line.kind, line.section ?? "") ?? (line.section?.trim() || sections[line.kind][0]),
    current: safeAmount(line.current),
    previous: safeAmount(line.previous),
  })),
  updatedAt: declaration.updatedAt || new Date().toISOString(),
});

export const calculateSummary = (declaration: DsfDeclaration): DsfSummary => {
  const normalized = normalizeDeclaration(declaration);
  const assets = sum(normalized.lines, "asset");
  const liabilities = sum(normalized.lines, "liability");
  const revenue = sum(normalized.lines, "income");
  const expenses = sum(normalized.lines, "expense");
  const receipts = sum(normalized.lines, "receipt");
  const payments = sum(normalized.lines, "payment");
  const netIncome = revenue - expenses;
  const resultLines = normalized.lines.filter(isResultLine);
  const balanceSheetResult = resultLines.length > 0 ? resultLines.reduce((total, line) => total + line.current, 0) : null;
  // Le résultat n'est ajouté au passif que s'il n'y figure pas déjà en ligne CJ.
  const totalLiabilities = liabilities + (balanceSheetResult === null ? netIncome : 0);
  const expectedClosingCash = normalized.profile.openingCash + receipts - payments;

  return {
    assets,
    liabilities,
    revenue,
    expenses,
    receipts,
    payments,
    netIncome,
    balanceSheetResult,
    totalLiabilities,
    balanceGap: assets - totalLiabilities,
    expectedClosingCash,
    cashGap: normalized.profile.closingCash - expectedClosingCash,
  };
};

export const validateDeclaration = (declaration: DsfDeclaration): ValidationIssue[] => {
  const normalized = normalizeDeclaration(declaration);
  const summary = calculateSummary(normalized);
  const issues: ValidationIssue[] = [];
  const fiscalYear = Number(normalized.profile.fiscalYear);

  if (!normalized.profile.name.trim()) issues.push({ severity: "error", message: "Renseignez la raison sociale." });
  if (!normalized.profile.taxpayerId.trim()) issues.push({ severity: "error", message: "Renseignez le NIU." });
  if (!normalized.profile.activity.trim()) issues.push({ severity: "error", message: "Renseignez l'activité principale." });
  if (!Number.isInteger(fiscalYear) || fiscalYear < 2000 || fiscalYear > currentYear) {
    issues.push({ severity: "error", message: `L'exercice fiscal doit être compris entre 2000 et ${currentYear}.` });
  }

  normalized.lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (!line.label.trim()) issues.push({ severity: "error", message: `Ligne ${lineNumber}: le libellé est obligatoire.` });
    // Seul le résultat net (CJ) peut être négatif : une perte s'y inscrit en moins.
    if (line.current < 0 && !isResultLine(line)) issues.push({ severity: "error", message: `Ligne ${lineNumber}: le montant N ne peut pas être négatif.` });
    if (!sections[line.kind].includes(line.section)) issues.push({ severity: "error", message: `Ligne ${lineNumber}: section « ${line.section} » inconnue pour ${kindLabels[line.kind]}. Choisissez une section dans la liste.` });
  });

  if (normalized.mode === "normal") {
    (["asset", "liability", "income", "expense"] as LineKind[]).forEach((kind) => {
      if (!normalized.lines.some((line) => line.kind === kind && line.current > 0)) {
        issues.push({ severity: "warning", message: `Aucune ligne significative pour ${kindLabels[kind]}.` });
      }
    });
    if (summary.balanceSheetResult === null) {
      normalized.lines.forEach((line, index) => {
        if (line.kind === "liability" && foldText(line.label).includes("resultat")) {
          issues.push({ severity: "warning", message: `Ligne ${index + 1}: si « ${line.label} » est le résultat de l'exercice, donnez-lui le code ${resultCode}, sinon il est compté deux fois au passif.` });
        }
      });
    } else if (Math.abs(summary.balanceSheetResult - summary.netIncome) > 1) {
      issues.push({ severity: "error", message: `Le résultat au passif (${resultCode}: ${formatCurrency(summary.balanceSheetResult)}) diffère du résultat du compte de résultat (${formatCurrency(summary.netIncome)}).` });
    }
    if (Math.abs(summary.balanceGap) > 1) {
      issues.push({ severity: "error", message: `Bilan non équilibré: écart ${formatCurrency(summary.balanceGap)}.` });
    }
  } else {
    if (summary.receipts + summary.payments <= 0) issues.push({ severity: "error", message: "Ajoutez au moins une recette ou une dépense SMT." });
    if (Math.abs(summary.cashGap) > 1) issues.push({ severity: "warning", message: `Écart caisse ${formatCurrency(summary.cashGap)}.` });
  }

  if (!issues.some((issue) => issue.severity !== "success")) {
    issues.push({ severity: "success", message: "Les contrôles de base sont cohérents. La liasse peut être exportée." });
  }
  return issues;
};

export const loadDeclaration = (mode: DsfMode) => {
  if (typeof window === "undefined") return createDeclaration(mode);
  const raw = window.localStorage.getItem(storageKey(mode));
  if (!raw) return createDeclaration(mode);
  try {
    return normalizeDeclaration(JSON.parse(raw) as DsfDeclaration);
  } catch {
    return createDeclaration(mode);
  }
};

export const saveDeclaration = (declaration: DsfDeclaration) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(declaration.mode), JSON.stringify({ ...declaration, updatedAt: new Date().toISOString() }));
  }
};

export const clearDeclaration = (mode: DsfMode) => {
  if (typeof window !== "undefined") window.localStorage.removeItem(storageKey(mode));
};

export const parseCsv = (mode: DsfMode, csv: string): CsvImport => {
  const lines: DsfLine[] = [];
  const issues: ValidationIssue[] = [];
  csv.split(/\r?\n/).forEach((rawRow, index) => {
    const row = rawRow.trim();
    const rowNumber = index + 1;
    if (!row || /^(type|etat|état);/i.test(row)) return;
    const [kindCell = "", code = "", section = "", label = "", current = "", previous = "", date = "", reference = ""] = row.split(";").map((cell) => cell.trim());
    const kind = parseKind(mode, kindCell);
    if (!kind) {
      issues.push({ severity: "error", message: `Ligne ${rowNumber} du CSV: type « ${kindCell} » non reconnu en ${modeLabels[mode]} (attendu : ${expectedKinds[mode]}).` });
      return;
    }
    const [currentAmount, previousAmount] = ([["N", current], ["N-1", previous]] as const).map(([column, cell]) => {
      const amount = parseAmount(cell);
      if (amount === null) issues.push({ severity: "error", message: `Ligne ${rowNumber} du CSV: montant ${column} « ${cell} » illisible.` });
      return amount ?? 0;
    });
    lines.push({ ...createLine(kind, code, label), section: findSection(kind, section) ?? (section || sections[kind][0]), current: currentAmount, previous: previousAmount, date: date || `${currentYear - 1}-12-31`, reference });
  });
  // Import tout ou rien : un CSV en erreur ne remplace aucune ligne, pour qu'aucun montant faux n'atteigne l'export.
  return { lines: issues.some((issue) => issue.severity === "error") ? [] : lines, issues };
};

export const exportDeclarationToXlsx = (declaration: DsfDeclaration) => {
  const normalized = normalizeDeclaration(declaration);
  const summary = calculateSummary(normalized);
  const issues = validateDeclaration(normalized);
  const generatedAt = new Date().toISOString();
  const sheets: WorkbookSheet[] = [
    { name: "Meta", rows: [["Champ", "Valeur"], ["Application", "DSFacile"], ["Module", modeLabels[normalized.mode]], ["Généré le", generatedAt], ["Empreinte", fingerprint(normalized, generatedAt)]] },
    { name: "Identification", rows: [["Champ", "Valeur"], ["Raison sociale", normalized.profile.name], ["NIU", normalized.profile.taxpayerId], ["RCCM", normalized.profile.tradeRegister], ["Centre", normalized.profile.taxCenter], ["Ville", normalized.profile.city], ["Activité", normalized.profile.activity], ["Exercice", normalized.profile.fiscalYear], ["Exercice N-1", normalized.profile.previousFiscalYear]] },
    ...statementSheets(normalized),
    { name: "Synthèse", rows: [["Indicateur", "Montant"], ["Actif", summary.assets], ["Passif", summary.liabilities], ["Total passif (résultat inclus)", summary.totalLiabilities], ["Produits", summary.revenue], ["Charges", summary.expenses], ["Résultat", summary.netIncome], ["Écart bilan", summary.balanceGap], ["Recettes", summary.receipts], ["Dépenses", summary.payments], ["Solde final calculé", summary.expectedClosingCash], ["Écart caisse", summary.cashGap]] },
    { name: "Contrôles", rows: [["Sévérité", "Message"], ...issues.map((issue) => [issue.severity.toUpperCase(), issue.message])] },
  ];
  downloadBlob(createXlsxBlob(sheets), `DSFacile_${normalized.mode}_${normalized.profile.taxpayerId || "NIU"}_${normalized.profile.fiscalYear}.xlsx`);
};

export const formatCurrency = (value: number) => new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(value || 0);
export const numberValue = (value: string | number) => {
  const parsed = typeof value === "number" ? value : Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};
/**
 * Lit un montant saisi à la main ou exporté d'un tableur : « 1 500 000 », « 1.500.000 », « 1,500,000 »,
 * « 1 500 000,50 », « 1.500.000,50 », « -1 500 », « (1 500) », « 250 000 FCFA », « 1e6 ».
 * Le franc CFA n'ayant pas de subdivision en usage, un séparateur unique suivi de trois chiffres
 * (« 1.500 ») est lu comme séparateur de milliers. Retourne null si le texte n'est pas un montant.
 */
export const parseAmount = (value: string): number | null => {
  let text = (value ?? "").replace(/\s/g, "").replace(/'/g, "").replace(/(fcfa|xaf)$/i, "");
  if (!text) return 0;
  let sign = 1;
  if (/^\(.*\)$/.test(text)) {
    sign = -1;
    text = text.slice(1, -1);
  }
  if (text.startsWith("-")) {
    sign = -sign;
    text = text.slice(1);
  } else if (text.startsWith("+")) {
    text = text.slice(1);
  }
  // Notation scientifique produite par certains tableurs : 1e6, 2.5E+7, 2,5E+7.
  if (/^\d+([.,]\d+)?e[+-]?\d+$/i.test(text)) {
    const scientific = Number(text.replace(",", "."));
    return Number.isFinite(scientific) ? sign * scientific : null;
  }
  const lastDot = text.lastIndexOf(".");
  const lastComma = text.lastIndexOf(",");
  if (lastDot >= 0 && lastComma >= 0) {
    const decimal = lastDot > lastComma ? "." : ",";
    const parts = text.split(decimal);
    if (parts.length !== 2) return null;
    const groups = parts[0].split(decimal === "." ? "," : ".");
    if (!isThousandsGrouping(groups)) return null;
    text = `${groups.join("")}.${parts[1]}`;
  } else if (lastDot >= 0 || lastComma >= 0) {
    const groups = text.split(lastDot >= 0 ? "." : ",");
    if (groups.length > 2) {
      if (!isThousandsGrouping(groups)) return null;
      text = groups.join("");
    } else {
      text = isThousandsGrouping(groups) && groups[0] !== "0" ? groups.join("") : groups.join(".");
    }
  }
  return /^\d+(\.\d+)?$/.test(text) ? sign * Number(text) : null;
};
export const createId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `dsf-${Date.now()}-${Math.random().toString(36).slice(2)}`);

const storageKey = (mode: DsfMode) => `dsfacile:${mode}:declaration:v1`;
const safeAmount = (value: number) => (Number.isFinite(value) ? Math.round(value) : 0);
const sum = (lines: DsfLine[], kind: LineKind) => lines.filter((line) => line.kind === kind).reduce((total, line) => total + safeAmount(line.current), 0);
const isThousandsGrouping = (groups: string[]) => /^\d{1,3}$/.test(groups[0]) && groups.slice(1).every((group) => /^\d{3}$/.test(group));
const foldText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’`]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
/** Retrouve la section officielle sans tenir compte des accents, de la casse ni des espaces. */
const findSection = (kind: LineKind, value: string) => sections[kind]?.find((section) => foldText(section) === foldText(value));
const isResultLine = (line: DsfLine) => line.kind === "liability" && line.code.trim().toUpperCase() === resultCode;
/** Accepte les types en anglais ou en français, ainsi que les libellés de la colonne « Type » des exports XLSX. */
const parseKind = (mode: DsfMode, value: string): LineKind | null => {
  const key = foldText(value);
  const match = (Object.entries(kindAliases[mode]) as [LineKind, string[]][]).find(([kind, aliases]) => aliases.includes(key) || foldText(kindLabels[kind]) === key);
  return match ? match[0] : null;
};
const statementSheets = (declaration: DsfDeclaration): WorkbookSheet[] => {
  const kinds: LineKind[] = declaration.mode === "normal" ? ["asset", "liability", "income", "expense"] : ["receipt", "payment"];
  return kinds.map((kind) => ({ name: kindLabels[kind].slice(0, 31), rows: [["Type", "Code", "Section", "Libellé", "N", "N-1", "Date", "Référence"], ...declaration.lines.filter((line) => line.kind === kind).map((line) => [kindLabels[line.kind], line.code, line.section, line.label, line.current, line.previous, line.date, line.reference])] }));
};

const createXlsxBlob = (sheets: WorkbookSheet[]) => {
  const files = new Map<string, Uint8Array>();
  files.set("[Content_Types].xml", bytes(contentTypesXml(sheets.length)));
  files.set("_rels/.rels", bytes(rootRelsXml()));
  files.set("xl/workbook.xml", bytes(workbookXml(sheets)));
  files.set("xl/_rels/workbook.xml.rels", bytes(workbookRelsXml(sheets.length)));
  sheets.forEach((sheet, index) => files.set(`xl/worksheets/sheet${index + 1}.xml`, bytes(worksheetXml(sheet.rows))));
  return new Blob([zipFiles(files)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
};
const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.replace(/[^a-z0-9_.-]/gi, "_");
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
const worksheetXml = (rows: (string | number)[][]) => `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((cell, cellIndex) => cellXml(cell, col(cellIndex + 1), rowIndex + 1)).join("")}</row>`).join("")}</sheetData></worksheet>`;
const cellXml = (value: string | number, column: string, row: number) => typeof value === "number" ? `<c r="${column}${row}"><v>${Number.isFinite(value) ? value : 0}</v></c>` : `<c r="${column}${row}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`;
const contentTypesXml = (count: number) => `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${Array.from({ length: count }, (_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`;
const rootRelsXml = () => `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
const workbookXml = (sheets: WorkbookSheet[]) => `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((sheet, index) => `<sheet name="${xml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}</sheets></workbook>`;
const workbookRelsXml = (count: number) => `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${Array.from({ length: count }, (_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}</Relationships>`;
const bytes = (text: string) => encoder.encode(text);
const col = (n: number) => n <= 26 ? String.fromCharCode(64 + n) : `${col(Math.floor((n - 1) / 26))}${col(((n - 1) % 26) + 1)}`;
const xml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const crcTable = Array.from({ length: 256 }, (_, i) => { let c = i; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (data: Uint8Array) => { let crc = 0xffffffff; data.forEach((byte) => { crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8); }); return (crc ^ 0xffffffff) >>> 0; };
const zipFiles = (files: Map<string, Uint8Array>) => {
  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  files.forEach((content, nameText) => {
    const name = bytes(nameText);
    const crc = crc32(content);
    const head = localHeader(name, content, crc);
    local.push(head, content);
    central.push(centralHeader(name, content, crc, offset));
    offset += head.length + content.length;
  });
  const centralSize = central.reduce((total, part) => total + part.length, 0);
  return concat([...local, ...central, endHeader(files.size, centralSize, offset)]);
};
const localHeader = (name: Uint8Array, content: Uint8Array, crc: number) => header(30 + name.length, (view) => { view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true); view.setUint32(14, crc, true); view.setUint32(18, content.length, true); view.setUint32(22, content.length, true); view.setUint16(26, name.length, true); }, name, 30);
const centralHeader = (name: Uint8Array, content: Uint8Array, crc: number, offset: number) => header(46 + name.length, (view) => { view.setUint32(0, 0x02014b50, true); view.setUint16(4, 20, true); view.setUint16(6, 20, true); view.setUint32(16, crc, true); view.setUint32(20, content.length, true); view.setUint32(24, content.length, true); view.setUint16(28, name.length, true); view.setUint32(42, offset, true); }, name, 46);
const endHeader = (count: number, size: number, offset: number) => header(22, (view) => { view.setUint32(0, 0x06054b50, true); view.setUint16(8, count, true); view.setUint16(10, count, true); view.setUint32(12, size, true); view.setUint32(16, offset, true); });
const header = (length: number, write: (view: DataView) => void, name?: Uint8Array, nameOffset = 0) => { const output = new Uint8Array(length); write(new DataView(output.buffer)); if (name) output.set(name, nameOffset); return output; };
const concat = (arrays: Uint8Array[]) => { const out = new Uint8Array(arrays.reduce((t, a) => t + a.length, 0)); let offset = 0; arrays.forEach((a) => { out.set(a, offset); offset += a.length; }); return out; };
const fingerprint = (declaration: DsfDeclaration, generatedAt: string) => {
  const payload = JSON.stringify({ declaration, generatedAt });
  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) hash = ((hash << 5) - hash + payload.charCodeAt(i)) | 0;
  return `DSF-${Math.abs(hash).toString(16).toUpperCase()}`;
};
