export default function BenefitsSection() {
  const benefits = [
    {
      statistic: "90%",
      title: "Reducción en tiempo de procesamiento",
      description: "Menos tiempo en gestión manual"
    },
    {
      statistic: "100%",
      title: "Trazabilidad de documentos",
      description: "Historial completo de acciones"
    },
    {
      statistic: "0",
      title: "Documentos perdidos",
      description: "Todo almacenado de forma segura"
    },
    {
      statistic: "24/7",
      title: "Acceso disponible",
      description: "Desde cualquier dispositivo"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">
          Resultados que hablan por sí solos
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Empresas que confían en SignFlow han transformado su gestión documental
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-5xl font-bold text-blue-600 mb-4">{benefit.statistic}</div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
