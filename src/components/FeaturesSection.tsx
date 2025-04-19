import { FileText, Upload, Calculator, CheckCircle, Download, Shield } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: "DSF Système Normal & SMT",
    description: "Génération automatique des DSF conformes aux modèles officiels de la DGI, pour le Système Normal et le SMT."
  },
  {
    icon: Upload,
    title: "Import de données",
    description: "Importez facilement vos balances comptables et autres données financières depuis Excel ou CSV."
  },
  {
    icon: Calculator,
    title: "Calculs automatiques",
    description: "Les totaux, sous-totaux et reports sont calculés automatiquement, réduisant les risques d'erreur."
  },
  {
    icon: CheckCircle,
    title: "Contrôles de cohérence",
    description: "Vérifications automatiques pour garantir la cohérence entre les différents tableaux de la liasse fiscale."
  },
  {
    icon: Download,
    title: "Export PDF",
    description: "Générez des documents PDF prêts à l'emploi, conformes aux exigences de présentation de la DGI."
  },
  {
    icon: Shield,
    title: "Sécurité des données",
    description: "Vos données financières sont chiffrées et sécurisées, avec un accès strictement contrôlé."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Fonctionnalités clés</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Notre solution vous offre tous les outils nécessaires pour simplifier la préparation de vos DSF
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="feature-icon">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
