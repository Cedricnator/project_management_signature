'use client';

import { useState } from 'react';
import ContactFormModal from './ContactFormModal';

interface HeroProps {
  onCtaClick?: () => void;
}

export default function Hero({ onCtaClick }: HeroProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      setIsModalOpen(true);
    }
  };
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="text-sm">🔒 Firma digital certificada y segura</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-6">
            Gestión de documentos <span className="text-yellow-300">sin papel</span>
          </h1>
          
          <p className="text-xl mb-4">
            Reduce la gestión manual de documentos. Permite a tus empleados subir permisos, licencias y certificados.
          </p>
          
                    <button
            type="button"
            onClick={handleCtaClick}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            Solicitar demo →
          </button>
          <ContactFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          
          <div className="flex justify-center gap-8 text-sm mt-8">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Configuración en 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💬</span>
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
