import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildMailtoLink } from "@/lib/contact";

// Ce que l'application fait réellement aujourd'hui : à tenir à jour avec les fonctionnalités livrées.
const included = [
  "DSF Système Normal et Système Minimal de Trésorerie",
  "Saisie guidée et import CSV depuis le modèle fourni",
  "Contrôles de cohérence avant export",
  "Export XLSX de préparation et de revue interne",
  "Sauvegarde et restauration de vos dossiers (JSON)",
  "Données conservées dans votre navigateur, sans compte",
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Tarifs</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            DSFacile est gratuit, sans compte et sans engagement.
          </p>
        </div>

        <div className="mx-auto max-w-md bg-white rounded-lg shadow-md p-8 border-2 border-accent">
          <h3 className="text-xl font-bold text-primary mb-2">Gratuit</h3>
          <div className="text-4xl font-bold text-primary-dark mb-6">
            0 <span className="text-base font-normal text-gray-500">F CFA</span>
          </div>
          <ul className="space-y-3 mb-8">
            {included.map((item) => (
              <li key={item} className="flex items-start">
                <Check className="text-accent mr-2 mt-0.5 w-5 h-5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/app">
            <Button className="w-full bg-accent hover:bg-secondary">Ouvrir l'application</Button>
          </Link>
        </div>

        <p className="mt-8 text-center text-gray-600">
          Vous êtes un cabinet comptable ou vous préparez les DSF de plusieurs entreprises ?{" "}
          <a
            href={buildMailtoLink("DSFacile — Cabinet comptable", "Bonjour,\n\nJe souhaite échanger sur l'utilisation de DSFacile pour mon cabinet.\n\nCabinet :\nNombre de dossiers :\nBesoin :\n")}
            className="text-secondary underline hover:text-primary"
          >
            Écrivez-nous
          </a>
          .
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
