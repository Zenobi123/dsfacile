import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Plus, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { calculateSummary, clearDeclaration, createDeclaration, createLine, DsfDeclaration, DsfLine, DsfMode, exportDeclarationToXlsx, formatCurrency, kindLabels, LineKind, loadDeclaration, modeLabels, normalizeDeclaration, numberValue, parseCsv, saveDeclaration, sections, validateDeclaration } from "@/features/dsf";

interface DsfWorkspaceProps {
  mode: DsfMode;
}

const availableKinds: Record<DsfMode, LineKind[]> = {
  normal: ["asset", "liability", "income", "expense"],
  smt: ["receipt", "payment"],
};

const DsfWorkspace = ({ mode }: DsfWorkspaceProps) => {
  const { toast } = useToast();
  const [declaration, setDeclaration] = useState<DsfDeclaration>(() => loadDeclaration(mode));
  const [csvPreview, setCsvPreview] = useState("");

  const summary = useMemo(() => calculateSummary(declaration), [declaration]);
  const issues = useMemo(() => validateDeclaration(declaration), [declaration]);
  const blocking = issues.some((issue) => issue.severity === "error");

  useEffect(() => {
    setDeclaration(loadDeclaration(mode));
    setCsvPreview("");
  }, [mode]);

  useEffect(() => {
    saveDeclaration(declaration);
  }, [declaration]);

  const updateProfile = (field: keyof DsfDeclaration["profile"], value: string | number) => {
    setDeclaration((current) => ({ ...current, profile: { ...current.profile, [field]: value }, updatedAt: new Date().toISOString() }));
  };

  const updateLine = (id: string, field: keyof DsfLine, value: string | number) => {
    setDeclaration((current) => ({
      ...current,
      lines: current.lines.map((line) => {
        if (line.id !== id) return line;
        if (field === "kind") {
          const kind = value as LineKind;
          return { ...line, kind, section: sections[kind][0] };
        }
        return { ...line, [field]: value };
      }),
      updatedAt: new Date().toISOString(),
    }));
  };

  const addLine = (kind: LineKind) => setDeclaration((current) => ({ ...current, lines: [...current.lines, createLine(kind)], updatedAt: new Date().toISOString() }));
  const removeLine = (id: string) => setDeclaration((current) => ({ ...current, lines: current.lines.filter((line) => line.id !== id), updatedAt: new Date().toISOString() }));

  const resetDraft = () => {
    clearDeclaration(mode);
    setDeclaration(createDeclaration(mode));
    setCsvPreview("");
    toast({ title: "Brouillon réinitialisé", description: `Un nouveau dossier ${modeLabels[mode]} vierge a été créé.` });
  };

  const exportBackup = () => {
    downloadText(JSON.stringify(normalizeDeclaration(declaration), null, 2), `DSFacile_${mode}_${declaration.profile.taxpayerId || "NIU"}.json`, "application/json;charset=utf-8");
    toast({ title: "Sauvegarde exportée", description: "Le dossier peut être restauré depuis ce fichier JSON." });
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = normalizeDeclaration(JSON.parse(await file.text()) as DsfDeclaration);
      setDeclaration({ ...parsed, mode });
      toast({ title: "Sauvegarde restaurée", description: "Le dossier a été chargé." });
    } catch {
      toast({ title: "Import impossible", description: "Le fichier JSON n'est pas une sauvegarde valide.", variant: "destructive" });
    } finally {
      event.target.value = "";
    }
  };

  const exportWorkbook = () => {
    if (blocking) {
      toast({ title: "Export bloqué", description: "Corrigez les erreurs obligatoires avant de générer la liasse XLSX.", variant: "destructive" });
      return;
    }
    exportDeclarationToXlsx(declaration);
    toast({ title: "Liasse XLSX générée", description: `Le classeur ${modeLabels[mode]} a été préparé.` });
  };

  const importCsvContent = (value: string) => {
    setCsvPreview(value);
    const lines = parseCsv(mode, value);
    if (lines.length > 0) setDeclaration((current) => ({ ...current, lines, updatedAt: new Date().toISOString() }));
  };

  const importCsvFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importCsvContent(await file.text());
    event.target.value = "";
  };

  const downloadTemplate = () => {
    const normalTemplate = "etat;code;section;libelle;n;n-1;date;reference\nasset;AD;Actif immobilisé;Immobilisations corporelles;1500000;1200000;;\nliability;CA;Capitaux propres;Capital;1000000;900000;;\nincome;TA;Produits d'exploitation;Ventes;2500000;2100000;;\nexpense;RA;Achats;Achats de marchandises;900000;800000;;\n";
    const smtTemplate = "type;code;section;libelle;montant;n-1;date;reference\nreceipt;;Ventes encaissées;Encaissement client;250000;0;2025-01-15;FAC-001\npayment;;Achats payés;Paiement fournisseur;90000;0;2025-01-20;FOU-001\n";
    downloadText(mode === "normal" ? normalTemplate : smtTemplate, `modele-${mode}-dsfacile.csv`, "text/csv;charset=utf-8");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="text-2xl font-bold">DSF<span className="text-accent">acile</span></Link>
            <p className="mt-1 text-sm text-white/80">Module intégré — {modeLabels[mode]}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={mode === "normal" ? "/app/smt" : "/app/normal"}>
              <Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-primary">Basculer {mode === "normal" ? "SMT" : "DSF normale"}</Button>
            </Link>
            <Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-primary" onClick={resetDraft}><Trash2 className="mr-2 h-4 w-4" /> Nouveau</Button>
            <Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-primary" onClick={exportBackup}><Save className="mr-2 h-4 w-4" /> JSON</Button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-white bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-primary">
              <Upload className="mr-2 h-4 w-4" /> Restaurer<input type="file" accept="application/json,.json" className="sr-only" onChange={importBackup} />
            </label>
            <Button className="bg-accent text-white hover:bg-accent/90" onClick={exportWorkbook}><FileSpreadsheet className="mr-2 h-4 w-4" /> Exporter XLSX</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-4 py-8">
        <section className="grid gap-4 md:grid-cols-4">
          {mode === "normal" ? (
            <>
              <Metric title="Total actif" value={formatCurrency(summary.assets)} helper={`Écart: ${formatCurrency(summary.balanceGap)}`} />
              <Metric title="Passif + résultat" value={formatCurrency(summary.liabilities + summary.netIncome)} helper="Passif + résultat" />
              <Metric title="Produits" value={formatCurrency(summary.revenue)} helper="Compte de résultat" />
              <Metric title="Résultat net" value={formatCurrency(summary.netIncome)} helper="Produits - charges" />
            </>
          ) : (
            <>
              <Metric title="Recettes" value={formatCurrency(summary.receipts)} helper="Encaissements" />
              <Metric title="Dépenses" value={formatCurrency(summary.payments)} helper="Décaissements" />
              <Metric title="Solde calculé" value={formatCurrency(summary.expectedClosingCash)} helper="Initial + flux net" />
              <Metric title="Écart caisse" value={formatCurrency(summary.cashGap)} helper="Saisi - calculé" />
            </>
          )}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="text-2xl font-bold text-primary">Identification contribuable — {modeLabels[mode]}</h1>
            <p className="mb-6 text-gray-600">Ces informations sont reprises dans la liasse exportée.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Raison sociale" value={declaration.profile.name} onChange={(value) => updateProfile("name", value)} required />
              <Field label="NIU" value={declaration.profile.taxpayerId} onChange={(value) => updateProfile("taxpayerId", value)} required />
              <Field label="RCCM" value={declaration.profile.tradeRegister} onChange={(value) => updateProfile("tradeRegister", value)} />
              <Field label="Centre des impôts" value={declaration.profile.taxCenter} onChange={(value) => updateProfile("taxCenter", value)} />
              <Field label="Ville" value={declaration.profile.city} onChange={(value) => updateProfile("city", value)} />
              <Field label="Activité" value={declaration.profile.activity} onChange={(value) => updateProfile("activity", value)} required />
              <Field label="Exercice N" type="number" value={declaration.profile.fiscalYear} onChange={(value) => updateProfile("fiscalYear", value)} required />
              {mode === "normal" ? <Field label="Exercice N-1" type="number" value={declaration.profile.previousFiscalYear} onChange={(value) => updateProfile("previousFiscalYear", value)} /> : null}
              {mode === "smt" ? <Field label="Solde initial caisse/banque" type="number" value={declaration.profile.openingCash} onChange={(value) => updateProfile("openingCash", numberValue(value))} /> : null}
              {mode === "smt" ? <Field label="Solde final caisse/banque" type="number" value={declaration.profile.closingCash} onChange={(value) => updateProfile("closingCash", numberValue(value))} /> : null}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-primary">Contrôles avant export</h2>
            <p className="mb-4 text-sm text-gray-600">Les erreurs bloquent l'export ; les avertissements restent visibles dans le XLSX.</p>
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={`${issue.severity}-${issue.message}`} className={`rounded-md border p-3 text-sm ${issueClass(issue.severity)}`}>
                  <div className="flex gap-2">{issue.severity === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}<span>{issue.message}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">{mode === "normal" ? "États financiers" : "Mouvements de trésorerie"}</h2>
              <p className="text-gray-600">Saisie intégrée, import CSV, sauvegarde locale et export XLSX.</p>
            </div>
            <div className="flex flex-wrap gap-2">{availableKinds[mode].map((kind) => <Button key={kind} variant="outline" onClick={() => addLine(kind)}><Plus className="mr-2 h-4 w-4" /> {kindLabels[kind]}</Button>)}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead><tr className="bg-primary text-left text-white"><th className="p-3">Type</th><th className="p-3">Code</th><th className="p-3">Section</th><th className="p-3">Libellé</th><th className="p-3">N / montant</th><th className="p-3">N-1</th><th className="p-3">Date</th><th className="p-3">Référence</th><th className="p-3">Action</th></tr></thead>
              <tbody>
                {declaration.lines.map((line) => (
                  <tr key={line.id} className="border-b">
                    <td className="p-2"><select className="w-full rounded-md border p-2" value={line.kind} onChange={(event) => updateLine(line.id, "kind", event.target.value)}>{availableKinds[mode].map((kind) => <option key={kind} value={kind}>{kindLabels[kind]}</option>)}</select></td>
                    <td className="p-2"><Input value={line.code} onChange={(event) => updateLine(line.id, "code", event.target.value)} /></td>
                    <td className="p-2"><select className="w-full rounded-md border p-2" value={line.section} onChange={(event) => updateLine(line.id, "section", event.target.value)}>{sections[line.kind].map((section) => <option key={section} value={section}>{section}</option>)}</select></td>
                    <td className="p-2"><Input value={line.label} onChange={(event) => updateLine(line.id, "label", event.target.value)} /></td>
                    <td className="p-2"><Input type="number" value={line.current} onChange={(event) => updateLine(line.id, "current", numberValue(event.target.value))} /></td>
                    <td className="p-2"><Input type="number" value={line.previous} onChange={(event) => updateLine(line.id, "previous", numberValue(event.target.value))} disabled={mode === "smt"} /></td>
                    <td className="p-2"><Input type="date" value={line.date} onChange={(event) => updateLine(line.id, "date", event.target.value)} /></td>
                    <td className="p-2"><Input value={line.reference} onChange={(event) => updateLine(line.id, "reference", event.target.value)} /></td>
                    <td className="p-2"><Button variant="ghost" size="sm" onClick={() => removeLine(line.id)} aria-label="Supprimer la ligne"><Trash2 className="h-4 w-4 text-red-600" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-primary">Import CSV</h2><p className="text-sm text-gray-600">Format compatible avec le modèle téléchargeable.</p></div><div className="flex gap-2"><label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"><Upload className="mr-2 h-4 w-4" /> Importer<input type="file" accept=".csv,text/csv" className="sr-only" onChange={importCsvFile} /></label><Button variant="outline" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" /> Modèle</Button></div></div>
            <Textarea className="min-h-[180px] font-mono text-xs" value={csvPreview} onChange={(event) => importCsvContent(event.target.value)} placeholder={mode === "normal" ? "asset;AD;Actif immobilisé;Immobilisations;1500000;1200000;;" : "receipt;;Ventes encaissées;Encaissement client;250000;0;2025-01-15;FAC-001"} />
          </div>
          <div className="rounded-lg bg-white p-6 shadow"><h2 className="text-xl font-semibold text-primary">Export XLSX intégré</h2><p className="mt-2 text-gray-600">Le classeur généré contient identification, tableaux métier, synthèse, contrôles et empreinte de contrôle.</p><Button className="mt-5 bg-primary" onClick={exportWorkbook} disabled={blocking}><FileSpreadsheet className="mr-2 h-4 w-4" /> Générer la liasse XLSX</Button></div>
        </section>
      </main>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", required = false }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean }) => <div className="space-y-2"><Label>{label}{required ? <span className="text-red-600"> *</span> : null}</Label><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></div>;
const Metric = ({ title, value, helper }: { title: string; value: string; helper: string }) => <div className="rounded-lg bg-white p-5 shadow"><p className="text-sm text-gray-500">{title}</p><p className="mt-2 text-2xl font-bold text-primary">{value}</p><p className="mt-1 text-xs text-gray-500">{helper}</p></div>;
const downloadText = (content: string, fileName: string, mimeType: string) => { const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); };
const issueClass = (severity: string) => severity === "success" ? "border-green-200 bg-green-50 text-green-700" : severity === "warning" ? "border-yellow-200 bg-yellow-50 text-yellow-800" : "border-red-200 bg-red-50 text-red-700";

export default DsfWorkspace;
