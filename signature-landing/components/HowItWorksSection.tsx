export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Registro",
      description: "Crea tu cuenta en minutos"
    },
    {
      number: 2,
      title: "Sube documentos",
      description: "Carga permisos, licencias y certificados"
    },
    {
      number: 3,
      title: "Firma electrónica",
      description: "Valida con firma digital certificada"
    },
    {
      number: 4,
      title: "Almacenamiento",
      description: "Accede a tus documentos desde cualquier lugar"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">
          ¿Cómo funciona?
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Un proceso simple y seguro en 4 pasos
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
