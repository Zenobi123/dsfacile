import { Link } from "react-router-dom";
import { Calculator, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

const modules = [
  { href: "/app/normal", title: "DSF normale", description: "Bilan actif/passif, compte de résultat, contrôles d'équilibre, import CSV et export XLSX." },
  { href: "/app/smt", title: "DSF SMT", description: "Recettes encaissées, dépenses payées, contrôle de trésorerie, import CSV et export XLSX." },
];

const DsfHome = () => (
  <main className="min-h-screen bg-gray-50">
    <header className="bg-primary text-white"><div className="container mx-auto px-4 py-6"><Link to="/" className="text-2xl font-bold">DSF<span className="text-accent">acile</span></Link><p className="mt-2 text-white/80">Espace applicatif intégré de préparation DSF.</p></div></header>
    <section className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-2">
      {modules.map((module) => (
        <article key={module.href} className="rounded-lg bg-white p-6 shadow">
          <FileSpreadsheet className="mb-4 h-10 w-10 text-accent" />
          <h1 className="text-2xl font-bold text-primary">{module.title}</h1>
          <p className="mt-3 text-gray-600">{module.description}</p>
          <Link to={module.href}><Button className="mt-6 bg-primary"><Calculator className="mr-2 h-4 w-4" />Ouvrir le module</Button></Link>
        </article>
      ))}
    </section>
  </main>
);

export default DsfHome;
