interface CTAProps {
  onCtaClick?: () => void;
}

export default function CTA({ onCtaClick }: CTAProps) {
  return (
    <section className="py-20 bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Comienza a digitalizar hoy mismo
          </h2>
          <p className="text-xl mb-8">
            Únete a cientos de empresas que ya han eliminado el papel de su gestión documental
          </p>
          <button 
            type="button"
            onClick={onCtaClick}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 text-lg"
          >
            Solicitar demo →
          </button>
        </div>
      </div>
    </section>
  );
}
