import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const HeroSection = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [open, setOpen] = useState(false);

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demande envoyée!",
      description: "Nous vous contacterons bientôt pour planifier votre démo.",
    });
    setOpen(false);
  };

  return (
    <section className="bg-gradient-to-r from-primary to-secondary pt-32 pb-20 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Simplifiez vos Déclarations Statistiques et Fiscales au Cameroun
          </h1>
          <p className="text-lg mb-8 opacity-90">
            DSFacile est une solution SaaS qui automatise et simplifie la préparation de vos DSF (Normale et SMT) en conformité avec les exigences de la DGI du Cameroun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-secondary text-white">
                  Demander une démo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Demander une démo</DialogTitle>
                  <DialogDescription>
                    Remplissez le formulaire ci-dessous pour recevoir une démonstration personnalisée de DSFacile.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDemoRequest} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input 
                      id="company" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full">Envoyer la demande</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/20 hover:border-white/80 transition-colors duration-300"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 opacity-10">
        <img src="https://via.placeholder.com/500" alt="DSF" className="w-[500px] h-auto" />
      </div>
    </section>
  );
};

export default HeroSection;
