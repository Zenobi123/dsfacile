
import { Button } from "@/components/ui/button";
import ContactForm from "./ContactForm";

const CtaSection = () => {
  return <section className="py-16 bg-gradient-to-r from-secondary to-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à simplifier vos déclarations fiscales ?</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
          Commencez dès aujourd'hui et réduisez considérablement le temps et les efforts consacrés à la préparation de vos DSF.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-accent hover:bg-accent-light text-white">
            S'inscrire maintenant
          </Button>
          <ContactForm 
            trigger={
              <Button variant="outline" className="border-accent bg-white/80 hover:bg-accent/10 text-primary font-medium">
                Nous contacter
              </Button>
            } 
          />
        </div>
      </div>
    </section>;
};

export default CtaSection;

