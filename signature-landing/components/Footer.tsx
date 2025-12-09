'use client';

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Firmatic</h3>
            <p className="text-gray-400">
              La plataforma de firma digital que transforma la gestión documental empresarial
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a 
                  href="#caracteristicas" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('caracteristicas'); }} 
                  className="hover:text-white cursor-pointer"
                >
                  Características
                </a>
              </li>
              <li>
                <a 
                  href="#beneficios" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('beneficios'); }} 
                  className="hover:text-white cursor-pointer"
                >
                  Beneficios
                </a>
              </li>
              <li>
                <a 
                  href="#como-funciona" 
                  onClick={(e) => { e.preventDefault(); scrollToSection('como-funciona'); }} 
                  className="hover:text-white cursor-pointer"
                >
                  Cómo Funciona
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:firmaticenterprise@gmail.com" className="hover:text-white">firmaticenterprise@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+56912345678" className="hover:text-white">+56 9 1234 5678</a>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 Firmatic. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
