
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
    question: "Comment DSFacile protège-t-il mes données financières ?",
    answer: "Vos données sont chiffrées lors du transfert et du stockage. Nous utilisons des protocoles de sécurité avancés et des infrastructures cloud sécurisées. Seules les personnes autorisées de votre organisation peuvent accéder à vos informations grâce à un système de gestion des droits d'accès."
  },
  {
    question: "Puis-je importer des données depuis mon logiciel comptable ?",
    answer: "Oui, DSFacile permet d'importer des données depuis la plupart des logiciels comptables via des fichiers Excel ou CSV. Notre système reconnaît automatiquement les formats standards des balances comptables générées par SAGE, SAP, QuickBooks et autres solutions populaires au Cameroun."
  },
  {
    question: "Le logiciel est-il à jour avec la réglementation fiscale camerounaise ?",
    answer: "Absolument. Notre équipe d'experts fiscaux et juridiques surveille constamment les changements dans la législation fiscale camerounaise. Le logiciel est mis à jour régulièrement pour refléter les dernières exigences de la DGI, vous garantissant ainsi une conformité totale."
  },
  {
    question: "Est-ce que je peux essayer DSFacile avant de m'abonner ?",
    answer: "Oui, nous offrons une démo gratuite qui vous permet de tester les fonctionnalités principales de DSFacile. Vous pouvez également bénéficier d'un essai de 14 jours sans engagement pour évaluer pleinement la solution avec vos propres données."
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
