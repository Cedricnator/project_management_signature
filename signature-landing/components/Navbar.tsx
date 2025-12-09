'use client';

import { useState } from 'react';
import ContactFormModal from './ContactFormModal';

interface NavbarProps {
  onCtaClick?: () => void;
}

export default function Navbar({ onCtaClick }: NavbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      setIsModalOpen(true);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b" aria-label="Navegación principal">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              Firmatic
            </h1>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <a href="#caracteristicas" onClick={(e) => { e.preventDefault(); scrollToSection('caracteristicas'); }} className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Características
            </a>
            <a href="#beneficios" onClick={(e) => { e.preventDefault(); scrollToSection('beneficios'); }} className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Beneficios
            </a>
            <a href="#como-funciona" onClick={(e) => { e.preventDefault(); scrollToSection('como-funciona'); }} className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Cómo Funciona
            </a>
            <a href="#contacto" onClick={(e) => { e.preventDefault(); scrollToSection('contacto'); }} className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Contacto
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <button type="button" onClick={handleCtaClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Solicitar Demo
            </button>
          </div>
        </div>
      </div>
      <ContactFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav>
  );
}
