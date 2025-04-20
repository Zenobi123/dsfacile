import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from 'lucide-react';
const PricingSection = () => {
  const [activePeriod, setActivePeriod] = useState('standard');
  return <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Nos tarifs</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Des forfaits adaptés à toutes les tailles d'entreprises
          </p>
        </div>
        
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-md overflow-hidden">
            <button className={`pricing-tab ${activePeriod === 'standard' ? 'active' : ''}`} onClick={() => setActivePeriod('standard')}>
              Standard
            </button>
            <button className={`pricing-tab ${activePeriod === 'premium' ? 'active' : ''}`} onClick={() => setActivePeriod('premium')}>
              Premium
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          <div className="w-full md:w-72 bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
            <h3 className="text-xl font-bold text-primary mb-4">Starter</h3>
            <div className="text-4xl font-bold text-primary-dark mb-1">
              150 000 <span className="text-base font-normal text-gray-500">F CFA/an</span>
            </div>
            <div className="h-64 py-6">
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>1 entreprise</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>DSF SMT uniquement</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Importation de données</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Export XLSX</span>
              </div>
              <div className="mb-3 flex items-center">
                <X className="text-gray-400 mr-2 w-5 h-5" />
                <span className="text-gray-500">Archivage limité (1 an)</span>
              </div>
            </div>
            <Button className="w-full">Commencer</Button>
          </div>
          
          <div className="w-full md:w-72 bg-white rounded-lg shadow-md p-6 border-2 border-accent relative transition-transform hover:scale-105">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
              Plus populaire
            </div>
            <h3 className="text-xl font-bold text-primary mb-4">Business</h3>
            <div className="text-4xl font-bold text-primary-dark mb-1">
              300 000 <span className="text-base font-normal text-gray-500">F CFA/an</span>
            </div>
            <div className="h-64 py-6">
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Jusqu'à 3 entreprises</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>DSF Normale et SMT</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Importation de données</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Export XLSX</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Archivage illimité</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Support prioritaire</span>
              </div>
            </div>
            <Button className="w-full bg-accent hover:bg-secondary">Commencer</Button>
          </div>
          
          <div className="w-full md:w-72 bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
            <h3 className="text-xl font-bold text-primary mb-4">Enterprise</h3>
            <div className="text-4xl font-bold text-primary-dark mb-1">
              500 000 <span className="text-base font-normal text-gray-500">F CFA/an</span>
            </div>
            <div className="h-64 py-6">
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Entreprises illimitées</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>DSF Normale et SMT</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Importation de données</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Export XLSX
              </span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Archivage illimité</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>Support dédié</span>
              </div>
              <div className="mb-3 flex items-center">
                <Check className="text-accent mr-2 w-5 h-5" />
                <span>API pour intégration</span>
              </div>
            </div>
            <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-white">
              Contacter notre équipe
            </Button>
          </div>
        </div>
      </div>
    </section>;
};
export default PricingSection;