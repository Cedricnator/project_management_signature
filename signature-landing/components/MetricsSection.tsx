'use client';

import { useEffect, useState } from 'react';
import { getSystemMetrics, type SystemMetrics } from '../app/lib/metrics';

export default function MetricsSection() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSystemMetrics()
      .then((data) => {
        setMetrics(data);
        setIsLoading(false);
      })
      .catch(() => {
        setMetrics({
          totalUsers: 0,
          totalDocuments: 0,
          pendingSignatures: 0
        });
        setIsLoading(false);
      });
  }, []);

  const displayValue = (value: number | undefined) => {
    if (isLoading) return '...';
    return value ?? 0;
  };

  return (
    <section className="py-16 bg-gray-50" data-testid="metrics-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nuestros Números
          </h2>
          <p className="text-lg text-gray-600">
            Estadísticas en tiempo real de nuestra plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              <span data-testid="total-users-value">{displayValue(metrics?.totalUsers)}</span>
            </h3>
            <p className="text-gray-600">Usuarios Totales</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              <span data-testid="total-documents-value">{displayValue(metrics?.totalDocuments)}</span>
            </h3>
            <p className="text-gray-600">Documentos Gestionados</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              <span data-testid="pending-signatures-value">{displayValue(metrics?.pendingSignatures)}</span>
            </h3>
            <p className="text-gray-600">Pendientes de Firma</p>
          </div>
        </div>
      </div>
    </section>
  );
}
