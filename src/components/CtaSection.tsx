
import CtaHeader from "./cta/CtaHeader";
import CtaButtons from "./cta/CtaButtons";

const CtaSection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-secondary to-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <CtaHeader 
          title="Prêt à simplifier vos déclarations fiscales ?"
          description="Commencez dès aujourd'hui et réduisez considérablement le temps et les efforts consacrés à la préparation de vos DSF."
        />
        <CtaButtons />
      </div>
    </section>
  );
};

export default CtaSection;
