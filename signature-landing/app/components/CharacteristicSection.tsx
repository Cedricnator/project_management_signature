export default function CharacteristicSection() {
  const features = [
    {
      title: "Firma Digital Segura",
      description: "Firma electrónica con validez legal y certificación",
      icon: "✓"
    },
    {
      title: "Gestión Documental",
      description: "Organiza y almacena documentos de forma segura",
      icon: "📁"
    },
    {
      title: "Flujos de Trabajo",
      description: "Automatiza procesos de aprobación y firma",
      icon: "⚡"
    },
    {
      title: "Integración API",
      description: "Conecta con tus sistemas existentes",
      icon: "🔗"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Todo lo que necesitas para digitalizar
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
