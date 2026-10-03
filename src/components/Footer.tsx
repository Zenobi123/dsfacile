import { Link } from "react-router-dom";
import { CONTACT_CITY, CONTACT_EMAIL, CONTACT_PHONES, phoneLink } from "@/lib/contact";

const linkClass = "text-gray-300 hover:text-accent transition-colors";

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-accent">DSFacile</h3>
            <p className="text-gray-300">
              Outil gratuit de préparation des DSF camerounaises, Système Normal et Système Minimal de Trésorerie.
              Vos données restent dans votre navigateur.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-accent">Produit</h3>
            <ul className="space-y-2">
              <li><a href="#features" className={linkClass}>Fonctionnalités</a></li>
              <li><a href="#how-it-works" className={linkClass}>Comment ça marche</a></li>
              <li><a href="#pricing" className={linkClass}>Tarifs</a></li>
              <li><a href="#faq" className={linkClass}>Questions fréquentes</a></li>
              <li><Link to="/app" className={linkClass}>Ouvrir l'application</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-accent">Contact</h3>
            <ul className="space-y-2">
              <li><a href={`mailto:${CONTACT_EMAIL}`} className={`break-all ${linkClass}`}>{CONTACT_EMAIL}</a></li>
              {CONTACT_PHONES.map((phone) => (
                <li key={phone}><a href={phoneLink(phone)} className={linkClass}>{phone}</a></li>
              ))}
              <li className="text-gray-300">{CONTACT_CITY}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} DSFacile. Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
            <Link to="/conditions-utilisation" className="hover:text-accent transition-colors">Conditions d'utilisation</Link>
            <Link to="/confidentialite" className="hover:text-accent transition-colors">Politique de confidentialité</Link>
            <Link to="/mentions-legales" className="hover:text-accent transition-colors">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
