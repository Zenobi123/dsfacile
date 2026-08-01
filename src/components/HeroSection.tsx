
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CONTACT_EMAIL, openMailClient } from "@/lib/contact";

const HeroSection = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [open, setOpen] = useState(false);

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    openMailClient(
      "DSFacile — Demande de démonstration",
      `Nom : ${name}\nEmail : ${email}\nEntreprise : ${company}\n\nJe souhaite une démonstration de DSFacile.`,
    );
    toast({
      title: "Demande préparée",
      description: `Votre logiciel de messagerie s'ouvre avec un e-mail à destination de ${CONTACT_EMAIL}. Il reste à l'envoyer.`
    });
    setOpen(false);
  };

  const scrollToFAQ = () => {
    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
  };

  return <section className="bg-gradient-to-r from-primary to-secondary pt-32 pb-20 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Simplifiez vos Déclarations Statistiques et Fiscales au Cameroun
          </h1>
          <p className="text-lg mb-8 opacity-90">
            DSFacile est un outil de préparation de vos DSF (Normale et SMT) : saisie guidée, calculs
            automatiques, contrôles de cohérence et export XLSX. Les classeurs produits sont des
            documents de travail à faire valider avant dépôt auprès de la DGI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/app">
              <Button className="bg-accent hover:bg-secondary text-white">
                Ouvrir l'application DSF
              </Button>
            </Link>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-primary">
                  Demander une démo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Demander une démo</DialogTitle>
                  <DialogDescription>
                    Remplissez le formulaire : votre logiciel de messagerie s'ouvrira avec un e-mail
                    pré-rempli à destination de {CONTACT_EMAIL}, que vous n'aurez plus qu'à envoyer.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDemoRequest} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input id="company" value={company} onChange={e => setCompany(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full">Envoyer la demande</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              className="border-accent bg-white/80 hover:bg-accent/10 text-primary font-medium"
              onClick={scrollToFAQ}
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 opacity-10 hidden md:block pointer-events-none">
        <img src="/placeholder.svg" alt="" className="w-[500px] h-auto" />
      </div>
    </section>;
};

export default HeroSection;

