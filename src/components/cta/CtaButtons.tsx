
import { Button } from "@/components/ui/button";
import ContactForm from "../ContactForm";
import { Link } from 'react-router-dom';

const CtaButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link to="/login">
        <Button className="bg-accent hover:bg-accent-light text-white">
          S'inscrire maintenant
        </Button>
      </Link>
      <ContactForm 
        trigger={
          <Button variant="outline" className="border-accent bg-white/80 hover:bg-accent/10 text-primary font-medium">
            Nous contacter
          </Button>
        } 
      />
    </div>
  );
};

export default CtaButtons;
