
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ContactFormProps {
  trigger: React.ReactNode;
}

const ContactForm = ({ trigger }: ContactFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contactez-nous</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour nous envoyer un message.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Votre nom"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Votre email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet</Label>
            <Select value={subject} onValueChange={setSubject} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un sujet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="support">Support technique</SelectItem>
                <SelectItem value="billing">Facturation</SelectItem>
                <SelectItem value="feature">Suggestion de fonctionnalité</SelectItem>
                <SelectItem value="partnership">Partenariat</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Votre message"
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Envoyer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactForm;
