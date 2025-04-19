
import { useState, useEffect } from 'react';

const testimonials = [
  {
    content: "DSFacile nous a fait gagner un temps considérable dans la préparation de nos déclarations fiscales. Ce qui prenait auparavant plusieurs semaines se fait désormais en quelques jours, avec une précision accrue.",
    author: "Jean Ngambi",
    role: "Directeur Financier, Entreprise XYZ"
  },
  {
    content: "En tant que cabinet comptable gérant plus de 50 entreprises, DSFacile est devenu un outil indispensable. L'interface intuitive et les contrôles automatiques ont considérablement réduit nos erreurs.",
    author: "Marie Atangana",
    role: "Expert-Comptable, Cabinet ABC"
  },
  {
    content: "La transition vers DSFacile a été simple et l'équipe de support est toujours disponible pour nous aider. Je recommande vivement cette solution à toutes les PME camerounaises.",
    author: "Paul Ekambi",
    role: "PDG, StartUp Innovation"
  }
];

const TestimonialsSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-accent-extraLight">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Ce que disent nos clients</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Découvrez pourquoi les entreprises et les cabinets comptables nous font confiance
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="max-w-3xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`transition-opacity duration-500 ${activeSlide === index ? 'opacity-100' : 'opacity-0 absolute top-0 left-0 right-0'}`}
              >
                <div className="bg-white rounded-lg p-8 shadow-md text-center">
                  <p className="text-lg text-gray-600 italic mb-6">"{testimonial.content}"</p>
                  <div className="font-semibold text-primary">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button 
                key={index}
                className={`dot ${activeSlide === index ? 'active' : ''}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
