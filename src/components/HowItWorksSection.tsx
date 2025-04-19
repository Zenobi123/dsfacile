
const steps = [
  {
    number: 1,
    title: "Créez un compte",
    description: "Inscrivez-vous et configurez votre profil d'entreprise avec vos informations fiscales."
  },
  {
    number: 2,
    title: "Importez vos données",
    description: "Importez votre balance comptable ou saisissez vos données financières."
  },
  {
    number: 3,
    title: "Vérifiez et complétez",
    description: "Notre système remplit automatiquement les formulaires et vous guide pour les compléter."
  },
  {
    number: 4,
    title: "Générez votre DSF",
    description: "Exportez votre DSF au format PDF, prête à être déposée à la DGI."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Comment ça marche</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Notre solution vous guide à travers un processus simple et intuitif
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {steps.map((step) => (
            <div key={step.number} className="w-full sm:w-[45%] lg:w-64 text-center mb-8">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
