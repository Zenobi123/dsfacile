
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Handle login
      console.log('Login submitted');
    } else {
      // Handle registration
      console.log('Registration submitted');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <header className="bg-primary shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            DSF<span className="text-accent">acile</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm sm:text-base">
            <Link to="/" className="text-white hover:text-accent transition-colors">Accueil</Link>
            <Link to="#" className="text-white hover:text-accent transition-colors">Contact</Link>
            <Link to="#" className="text-white hover:text-accent transition-colors">Aide</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[450px] bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary p-6 text-center text-white">
            <h1 className="text-2xl font-semibold mb-2">Bienvenue sur DSFacile</h1>
            <p className="text-sm opacity-80">Simplifiez vos déclarations fiscales au Cameroun</p>
          </div>

          <div className="p-6">
            <div className="flex mb-6 border-b">
              <button
                className={`flex-1 pb-2 font-semibold ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                onClick={() => setIsLogin(true)}
              >
                Connexion
              </button>
              <button
                className={`flex-1 pb-2 font-semibold ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                onClick={() => setIsLogin(false)}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <div className="relative">
                    <Input id="name" placeholder="Votre nom complet" className="pl-10" />
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email{!isLogin && " professionnel"}</Label>
                <div className="relative">
                  <Input type="email" id="email" placeholder="Votre adresse email" className="pl-10" />
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <div className="relative">
                    <Input id="company" placeholder="Nom de votre entreprise" className="pl-10" />
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder={isLogin ? "Votre mot de passe" : "Créez un mot de passe"}
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="Confirmez votre mot de passe"
                      className="pl-10"
                    />
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {isLogin ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm text-gray-600">Se souvenir de moi</label>
                  </div>
                  <Link to="#" className="text-sm text-primary hover:text-accent">
                    Mot de passe oublié?
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    J'accepte les <Link to="#" className="text-primary hover:text-accent">conditions d'utilisation</Link> et
                    la <Link to="#" className="text-primary hover:text-accent">politique de confidentialité</Link>
                  </label>
                </div>
              )}

              <Button type="submit" className="w-full bg-accent hover:bg-accent-light">
                {isLogin ? "Se connecter" : "Créer un compte"}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OU</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                    <path fill="#03A9F4" d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20s20-8.954 20-20S35.046 4 24 4z"/>
                    <path fill="#FFF" d="M35 27h-7v7h-4v-7h-7v-4h7v-7h4v7h7v4z"/>
                  </svg>
                  Microsoft
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              En vous connectant, vous acceptez nos{' '}
              <Link to="#" className="text-primary hover:text-accent">Conditions d'utilisation</Link> et notre{' '}
              <Link to="#" className="text-primary hover:text-accent">Politique de confidentialité</Link>.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-[#1A3C5A] text-white py-4 text-center text-sm">
        <p>&copy; 2025 DSFacile - Tous droits réservés</p>
      </footer>
    </div>
  );
}
