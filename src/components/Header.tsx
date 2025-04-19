
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-primary fixed w-full top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-white">
          DSF<span className="text-accent">acile</span>
        </a>
        
        <div className="lg:hidden text-white" onClick={toggleMenu}>
          <Menu />
        </div>
        
        <nav className={`lg:flex ${isMenuOpen ? 'block fixed top-16 left-0 right-0 bg-primary shadow-md transition-transform transform translate-y-0' : 'hidden lg:block'}`}>
          <ul className="lg:flex lg:items-center lg:space-x-8 space-y-4 lg:space-y-0 p-4 lg:p-0">
            <li><a href="#features" className="text-white hover:text-accent transition-colors">Fonctionnalités</a></li>
            <li><a href="#how-it-works" className="text-white hover:text-accent transition-colors">Comment ça marche</a></li>
            <li><a href="#pricing" className="text-white hover:text-accent transition-colors">Tarifs</a></li>
            <li><a href="#faq" className="text-white hover:text-accent transition-colors">FAQ</a></li>
            <li>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                Connexion
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
