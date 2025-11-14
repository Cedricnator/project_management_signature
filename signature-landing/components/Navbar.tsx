interface NavbarProps {
  onCtaClick?: () => void;
}

export default function Navbar({ onCtaClick }: NavbarProps) {
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
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Características
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Beneficios
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Cómo Funciona
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Contacto
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <button type="button" onClick={onCtaClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Solicitar Demo
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
