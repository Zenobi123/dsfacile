
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qu'est-ce que la DSF et pourquoi est-elle obligatoire ?",
    answer: "La Déclaration Statistique et Fiscale (DSF) est un document comptable que toute entreprise camerounaise doit déposer annuellement auprès de la Direction Générale des Impôts (DGI). Elle permet à l'administration fiscale d'avoir une vision complète de la situation financière de l'entreprise et sert de base pour le calcul de divers impôts et taxes."
  },
  {
    question: "Où sont stockées mes données financières ?",
    answer: "Uniquement dans votre navigateur, sur votre poste. DSFacile fonctionne intégralement côté client : il n'y a ni compte, ni serveur, ni base de données, et aucune donnée n'est transmise à qui que ce soit. En contrepartie, vos saisies ne sont ni sauvegardées à distance ni synchronisées entre appareils : vider les données de votre navigateur les efface définitivement. Utilisez la sauvegarde JSON de l'application pour conserver vos dossiers."
  },
  {
    question: "Puis-je importer des données depuis mon logiciel comptable ?",
    answer: "DSFacile importe des fichiers CSV au format du modèle téléchargeable depuis l'application, où chaque ligne est déjà rattachée à une rubrique (actif, passif, produit, charge, recette ou dépense). L'import direct d'une balance comptable générale, avec reconnaissance automatique des exports SAGE, SAP ou QuickBooks, n'est pas encore disponible : le rapprochement entre vos comptes et les rubriques doit être fait en amont."
  },
  {
    question: "Le logiciel est-il à jour avec la réglementation fiscale camerounaise ?",
    answer: "DSFacile reprend la structure générale des états financiers SYSCOHADA, mais ne contient pas de référentiel officiel versionné par exercice et n'a pas fait l'objet d'une homologation par la DGI. Les classeurs produits sont des documents de préparation et de revue interne : ils doivent être vérifiés par un professionnel et confrontés aux modèles officiels en vigueur avant tout dépôt."
  },
  {
    question: "Combien coûte DSFacile ?",
    answer: "Rien : DSFacile est gratuit et s'utilise sans compte. Il suffit d'ouvrir le module DSF Normale ou SMT depuis le site. Aucune offre payante n'est proposée."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Questions fréquentes</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tout ce que vous devez savoir sur DSFacile et les déclarations fiscales au Cameroun
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-left font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-2 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
