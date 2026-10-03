import { crc32 } from "node:zlib";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calculateSummary,
  createDeclaration,
  createLine,
  csvTemplates,
  DsfDeclaration,
  exportDeclarationToXlsx,
  LineKind,
  normalizeDeclaration,
  parseAmount,
  parseCsv,
  validateDeclaration,
} from "./index";

type Row = [kind: LineKind, code: string, label: string, amount: number];

/** Déclaration en Système Normal dont l'identification est complète. */
const declaration = (rows: Row[]): DsfDeclaration => {
  const base = createDeclaration("normal");
  return {
    ...base,
    profile: { ...base.profile, name: "SARL Test", taxpayerId: "M0123", activity: "Commerce", fiscalYear: "2025" },
    lines: rows.map(([kind, code, label, amount]) => ({ ...createLine(kind, code, label), current: amount })),
  };
};

const messages = (decl: DsfDeclaration, severity: "error" | "warning") =>
  validateDeclaration(decl).filter((issue) => issue.severity === severity).map((issue) => issue.message);

describe("createDeclaration", () => {
  it("commence la DSF normale par les immobilisations corporelles en AI", () => {
    const [first] = createDeclaration("normal").lines;
    expect([first.kind, first.code, first.label]).toEqual(["asset", "AI", "Immobilisations corporelles"]);
  });

  it("propose une recette et une dépense en SMT", () => {
    expect(createDeclaration("smt").lines.map((line) => line.kind)).toEqual(["receipt", "payment"]);
  });
});

describe("bilan et résultat (ligne CJ)", () => {
  const balanced: Row[] = [
    ["asset", "AI", "Immobilisations", 1_500_000],
    ["liability", "CA", "Capital", 1_000_000],
    ["income", "TA", "Ventes", 2_500_000],
    ["expense", "RA", "Achats", 2_000_000],
  ];

  it("ajoute le résultat calculé au passif quand aucune ligne CJ n'existe", () => {
    const decl = declaration(balanced);
    const summary = calculateSummary(decl);
    expect(summary.balanceSheetResult).toBeNull();
    expect(summary.totalLiabilities).toBe(1_500_000);
    expect(summary.balanceGap).toBe(0);
    expect(messages(decl, "error")).toEqual([]);
  });

  it("ne compte pas deux fois le résultat saisi en ligne CJ", () => {
    const decl = declaration([...balanced, ["liability", "cj", "Résultat net", 500_000]]);
    const summary = calculateSummary(decl);
    expect(summary.balanceSheetResult).toBe(500_000);
    expect(summary.totalLiabilities).toBe(1_500_000);
    expect(summary.balanceGap).toBe(0);
    expect(messages(decl, "error")).toEqual([]);
  });

  it("accepte une perte saisie en négatif sur la ligne CJ", () => {
    const decl = declaration([
      ["asset", "AI", "Immobilisations", 500_000],
      ["liability", "CA", "Capital", 1_000_000],
      ["liability", "CJ", "Résultat net", -500_000],
      ["income", "TA", "Ventes", 1_500_000],
      ["expense", "RA", "Achats", 2_000_000],
    ]);
    expect(calculateSummary(decl).balanceGap).toBe(0);
    expect(messages(decl, "error")).toEqual([]);
  });

  it("refuse toujours un montant négatif hors ligne CJ", () => {
    const decl = declaration([
      ["asset", "AI", "Immobilisations", -5],
      ["liability", "CA", "Capital", -5],
    ]);
    expect(messages(decl, "error").filter((message) => message.includes("négatif"))).toHaveLength(2);
  });

  it("signale une ligne CJ différente du résultat du compte de résultat", () => {
    const decl = declaration([...balanced, ["liability", "CJ", "Résultat net", 600_000]]);
    expect(messages(decl, "error").some((message) => message.includes("diffère du résultat"))).toBe(true);
  });

  it("avertit quand un résultat est saisi au passif sans le code CJ", () => {
    const decl = declaration([...balanced, ["liability", "", "Résultat de l'exercice", 500_000]]);
    expect(messages(decl, "warning").some((message) => message.includes("code CJ"))).toBe(true);
  });

  it("bloque un bilan déséquilibré", () => {
    const decl = declaration([...balanced.slice(1), ["asset", "AI", "Immobilisations", 1_400_000]]);
    expect(calculateSummary(decl).balanceGap).toBe(-100_000);
    expect(messages(decl, "error").some((message) => message.startsWith("Bilan non équilibré"))).toBe(true);
  });
});

describe("contrôles SMT", () => {
  const smt = (receipt: number, payment: number, closingCash: number): DsfDeclaration => {
    const base = createDeclaration("smt");
    return {
      ...base,
      profile: { ...base.profile, name: "SARL Test", taxpayerId: "M0123", activity: "Commerce", fiscalYear: "2025", openingCash: 0, closingCash },
      lines: [{ ...createLine("receipt", "", "Encaissement"), current: receipt }, { ...createLine("payment", "", "Paiement"), current: payment }],
    };
  };

  it("calcule le solde de caisse attendu", () => {
    const summary = calculateSummary(smt(250_000, 90_000, 160_000));
    expect([summary.expectedClosingCash, summary.cashGap]).toEqual([160_000, 0]);
  });

  it("avertit en cas d'écart de caisse", () => {
    expect(messages(smt(250_000, 90_000, 250_000), "warning").some((message) => message.startsWith("Écart caisse"))).toBe(true);
  });

  it("exige au moins une recette ou une dépense", () => {
    expect(messages(smt(0, 0, 0), "error")).toContain("Ajoutez au moins une recette ou une dépense SMT.");
  });
});

describe("parseAmount", () => {
  it.each([
    ["1500000", 1_500_000],
    ["1 500 000", 1_500_000],
    ["1 500 000", 1_500_000],
    ["1.500.000", 1_500_000],
    ["1,500,000", 1_500_000],
    ["1 500 000,50", 1_500_000.5],
    ["1.500.000,50", 1_500_000.5],
    ["1,500,000.50", 1_500_000.5],
    ["1500,5", 1500.5],
    ["1500.5", 1500.5],
    ["1.500", 1500],
    ["0,125", 0.125],
    ["-1 500", -1500],
    ["(1 500)", -1500],
    ["250 000 FCFA", 250_000],
    ["1e6", 1_000_000],
    ["2.5E+7", 25_000_000],
    ["2,5E+7", 25_000_000],
    ["-1e3", -1000],
    ["", 0],
  ])("lit « %s » comme %d", (text, expected) => {
    expect(parseAmount(text)).toBe(expected);
  });

  it.each(["abc", "1.50.000", "1,5.3,2", "12-34", "1e", "e6", "1e400"])("refuse « %s »", (text) => {
    expect(parseAmount(text)).toBeNull();
  });
});

describe("parseCsv", () => {
  it.each(["normal", "smt"] as const)("importe le modèle %s sans aucune erreur", (mode) => {
    const { lines, issues } = parseCsv(mode, csvTemplates[mode]);
    expect(issues).toEqual([]);
    expect(lines.length).toBeGreaterThan(0);
    expect(messages({ ...createDeclaration(mode), lines }, "error").filter((message) => message.startsWith("Ligne"))).toEqual([]);
  });

  it("lit les montants aux formats français et anglais", () => {
    const { lines, issues } = parseCsv("normal", "asset;AI;Actif immobilisé;Immo;1.500.000;1 200 000;;");
    expect(issues).toEqual([]);
    expect([lines[0].current, lines[0].previous]).toEqual([1_500_000, 1_200_000]);
  });

  it("n'importe rien si un montant est illisible", () => {
    const { lines, issues } = parseCsv("normal", "asset;AI;Actif immobilisé;Immo;1.500.000;abc;;\nliability;CA;Capitaux propres;Capital;100;0;;");
    expect(lines).toEqual([]);
    expect(issues.map((issue) => issue.message)).toEqual(["Ligne 1 du CSV: montant N-1 « abc » illisible."]);
  });

  it("reconnaît les types en français, en anglais et les libellés XLSX", () => {
    const normal = parseCsv("normal", "etat;code;section;libelle;n;n-1;date;reference\nPassif;CA;;Capital;1;0;;\nCHARGES;RA;;Achats;1;0;;\nProduit;TA;;Ventes;1;0;;\nasset;AI;;Immo;1;0;;");
    expect(normal.issues).toEqual([]);
    expect(normal.lines.map((line) => line.kind)).toEqual(["liability", "expense", "income", "asset"]);
    const smt = parseCsv("smt", "type;code\nreceipt;;;A;1;0;;\nDépense;;;B;1;0;;\nRecette encaissée;;;C;1;0;;");
    expect(smt.lines.map((line) => line.kind)).toEqual(["receipt", "payment", "receipt"]);
  });

  it("n'importe rien si un type est inconnu ou vide", () => {
    const { lines, issues } = parseCsv("normal", "etat;code\nreceipt;X;;Inconnu;100;0;;\nPassif;CA;;Capital;100;0;;\n;X;;Vide;1;0;;");
    expect(lines).toEqual([]);
    expect(issues.map((issue) => issue.message.slice(0, 31))).toEqual(["Ligne 2 du CSV: type « receipt ", "Ligne 4 du CSV: type «  » non r"]);
    expect(parseCsv("smt", "receipt;;;A;1;0;;\nasset;;;D;1;0;;").lines).toEqual([]);
  });

  it("retrouve les sections malgré les accents, la casse et les apostrophes", () => {
    const { lines } = parseCsv("normal", "asset;AI;actif  IMMOBILISE;A;1;0;;\nincome;TA;Produits d’exploitation;B;1;0;;\nasset;AI;;C;1;0;;");
    expect(lines.map((line) => line.section)).toEqual(["Actif immobilisé", "Produits d'exploitation", "Actif immobilisé"]);
  });

  it("conserve une section inconnue pour que la validation la bloque", () => {
    const { lines, issues } = parseCsv("normal", "asset;AI;Ventes;Mauvaise section;100;0;;");
    expect(issues).toEqual([]);
    expect(lines[0].section).toBe("Ventes");
    const decl = { ...declaration([]), lines };
    expect(normalizeDeclaration(decl).lines[0].section).toBe("Ventes");
    expect(messages(decl, "error")).toContain("Ligne 1: section « Ventes » inconnue pour Actif. Choisissez une section dans la liste.");
  });
});

describe("normalizeDeclaration", () => {
  it("met en forme codes, NIU et montants", () => {
    const decl = declaration([["asset", " ai ", "Immo", 1500.6]]);
    const normalized = normalizeDeclaration({ ...decl, profile: { ...decl.profile, taxpayerId: " m0123 " } });
    expect(normalized.profile.taxpayerId).toBe("M0123");
    expect([normalized.lines[0].code, normalized.lines[0].current]).toEqual(["AI", 1501]);
  });
});

describe("exportDeclarationToXlsx", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /** Lit les entrées d'une archive ZIP non compressée, comme celle produite par le générateur. */
  const readZip = (bytes: Uint8Array) => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const entries = new Map<string, { data: Uint8Array; crc: number }>();
    let offset = 0;
    while (view.getUint32(offset, true) === 0x04034b50) {
      const size = view.getUint32(offset + 18, true);
      const nameLength = view.getUint16(offset + 26, true);
      const start = offset + 30 + nameLength + view.getUint16(offset + 28, true);
      const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
      entries.set(name, { data: bytes.subarray(start, start + size), crc: view.getUint32(offset + 14, true) });
      offset = start + size;
    }
    const end = bytes.byteLength - 22;
    return {
      entries,
      endSignature: view.getUint32(end, true),
      endEntryCount: view.getUint16(end + 10, true),
      endCentralOffset: view.getUint32(end + 16, true),
      centralOffset: offset,
    };
  };

  const exportWorkbook = async (decl: DsfDeclaration) => {
    let blob: Blob | undefined;
    const link = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    vi.stubGlobal("document", { createElement: () => link, body: { appendChild: vi.fn() } });
    vi.spyOn(URL, "createObjectURL").mockImplementation((value) => {
      blob = value as Blob;
      return "blob:test";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    exportDeclarationToXlsx(decl);
    expect(link.click).toHaveBeenCalledOnce();
    return { fileName: link.download, zip: readZip(new Uint8Array(await blob!.arrayBuffer())) };
  };

  const text = (data: Uint8Array) => new TextDecoder().decode(data);

  it("produit une archive XLSX valide avec les bons onglets et montants", async () => {
    const decl = declaration([
      ["asset", "AI", "Immobilisations", 1_500_000],
      ["liability", "CA", "Capital", 1_000_000],
      ["income", "TA", "Ventes", 2_500_000],
      ["expense", "RA", "Achats", 2_000_000],
    ]);
    const { fileName, zip } = await exportWorkbook({ ...decl, profile: { ...decl.profile, name: "SARL Test & Fils <éàç>" } });

    expect(fileName).toBe("DSFacile_normal_M0123_2025.xlsx");
    expect(zip.endSignature).toBe(0x06054b50);
    expect(zip.endEntryCount).toBe(zip.entries.size);
    expect(zip.endCentralOffset).toBe(zip.centralOffset);
    for (const [name, entry] of zip.entries) expect(crc32(entry.data), name).toBe(entry.crc);

    const workbook = text(zip.entries.get("xl/workbook.xml")!.data);
    const sheetNames = [...workbook.matchAll(/<sheet name="([^"]+)"/g)].map((match) => match[1]);
    expect(sheetNames).toEqual(["Meta", "Identification", "Actif", "Passif", "Produit", "Charge", "Synthèse", "Contrôles"]);

    const sheet = (name: string) => text(zip.entries.get(`xl/worksheets/sheet${sheetNames.indexOf(name) + 1}.xml`)!.data);
    expect(sheet("Identification")).toContain("SARL Test &amp; Fils &lt;éàç&gt;");
    const balanceRow = sheet("Synthèse").match(/<row[^>]*>(?:(?!<\/row>).)*Écart bilan.*?<\/row>/)?.[0];
    expect(balanceRow).toContain("<v>0</v>");
    expect(sheet("Contrôles")).toContain("Les contrôles de base sont cohérents.");
  });
});
