interface HeroProps {
  onCtaClick?: () => void;
}

export default function Hero({ onCtaClick }: HeroProps) {
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
            onClick={onCtaClick}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 text-lg mb-8 inline-flex items-center gap-2"
          >
            Solicitar demo →
          </button>
          
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
