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
  balanceGap: number;
  expectedClosingCash: number;
  cashGap: number;
}

export interface ValidationIssue {
  severity: Severity;
  message: string;
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
        createLine("asset", "AD", "Immobilisations corporelles"),
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
    section: sections[line.kind]?.includes(line.section) ? line.section : sections[line.kind][0],
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
  const expectedClosingCash = normalized.profile.openingCash + receipts - payments;

  return {
    assets,
    liabilities,
    revenue,
    expenses,
    receipts,
    payments,
    netIncome,
    balanceGap: assets - (liabilities + netIncome),
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
    if (line.current < 0) issues.push({ severity: "error", message: `Ligne ${lineNumber}: le montant N ne peut pas être négatif.` });
    if (!sections[line.kind].includes(line.section)) issues.push({ severity: "error", message: `Ligne ${lineNumber}: section incompatible.` });
  });

  if (normalized.mode === "normal") {
    (["asset", "liability", "income", "expense"] as LineKind[]).forEach((kind) => {
      if (!normalized.lines.some((line) => line.kind === kind && line.current > 0)) {
        issues.push({ severity: "warning", message: `Aucune ligne significative pour ${kindLabels[kind]}.` });
      }
    });
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

export const parseCsv = (mode: DsfMode, csv: string): DsfLine[] => csv
  .split(/\r?\n/)
  .map((row) => row.trim())
  .filter(Boolean)
  .filter((row) => !row.toLowerCase().startsWith("type;") && !row.toLowerCase().startsWith("etat;"))
  .map((row) => {
    const [kindCell, code, section, label, current, previous, date, reference] = row.split(";").map((cell) => cell.trim());
    const kind = parseKind(mode, kindCell);
    return { ...createLine(kind, code, label), section: section || sections[kind][0], current: numberValue(current), previous: numberValue(previous), date: date || `${currentYear - 1}-12-31`, reference: reference || "" };
  });

export const exportDeclarationToXlsx = (declaration: DsfDeclaration) => {
  const normalized = normalizeDeclaration(declaration);
  const summary = calculateSummary(normalized);
  const issues = validateDeclaration(normalized);
  const generatedAt = new Date().toISOString();
  const sheets: WorkbookSheet[] = [
    { name: "Meta", rows: [["Champ", "Valeur"], ["Application", "DSFacile"], ["Module", modeLabels[normalized.mode]], ["Généré le", generatedAt], ["Empreinte", fingerprint(normalized, generatedAt)]] },
    { name: "Identification", rows: [["Champ", "Valeur"], ["Raison sociale", normalized.profile.name], ["NIU", normalized.profile.taxpayerId], ["RCCM", normalized.profile.tradeRegister], ["Centre", normalized.profile.taxCenter], ["Ville", normalized.profile.city], ["Activité", normalized.profile.activity], ["Exercice", normalized.profile.fiscalYear], ["Exercice N-1", normalized.profile.previousFiscalYear]] },
    ...statementSheets(normalized),
    { name: "Synthèse", rows: [["Indicateur", "Montant"], ["Actif", summary.assets], ["Passif", summary.liabilities], ["Produits", summary.revenue], ["Charges", summary.expenses], ["Résultat", summary.netIncome], ["Écart bilan", summary.balanceGap], ["Recettes", summary.receipts], ["Dépenses", summary.payments], ["Solde final calculé", summary.expectedClosingCash], ["Écart caisse", summary.cashGap]] },
    { name: "Contrôles", rows: [["Sévérité", "Message"], ...issues.map((issue) => [issue.severity.toUpperCase(), issue.message])] },
  ];
  downloadBlob(createXlsxBlob(sheets), `DSFacile_${normalized.mode}_${normalized.profile.taxpayerId || "NIU"}_${normalized.profile.fiscalYear}.xlsx`);
};

export const formatCurrency = (value: number) => new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(value || 0);
export const numberValue = (value: string | number) => {
  const parsed = typeof value === "number" ? value : Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};
export const createId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `dsf-${Date.now()}-${Math.random().toString(36).slice(2)}`);

const storageKey = (mode: DsfMode) => `dsfacile:${mode}:declaration:v1`;
const safeAmount = (value: number) => (Number.isFinite(value) ? Math.round(value) : 0);
const sum = (lines: DsfLine[], kind: LineKind) => lines.filter((line) => line.kind === kind).reduce((total, line) => total + safeAmount(line.current), 0);
const parseKind = (mode: DsfMode, value: string): LineKind => {
  const normalized = value.toLowerCase();
  if (mode === "smt") return ["payment", "expense", "depense", "dépense"].includes(normalized) ? "payment" : "receipt";
  if (["liability", "passif"].includes(normalized)) return "liability";
  if (["income", "produit", "produits"].includes(normalized)) return "income";
  if (["expense", "charge", "charges"].includes(normalized)) return "expense";
  return "asset";
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
