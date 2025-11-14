# language: es
Característica: Visualización de métricas en la landing page
  Como visitante de la landing page
  Quiero ver las métricas del sistema en tiempo real
  Para conocer el estado actual de la plataforma

  Antecedentes:
    Dado que estoy en la landing page

  @positivo
  Escenario: Visitante ve el total de usuarios
    Y el sistema tiene 10 usuarios registrados
    Cuando la página carga las métricas
    Entonces el visitante debe ver la métrica "Usuarios Totales: 10"

  @positivo
  Escenario: Visitante ve el total de documentos
    Y el sistema tiene 10 documentos gestionados
    Cuando la página carga las métricas
    Entonces el visitante debe ver la métrica "Documentos Gestionados: 10"

  @positivo
  Escenario: Visitante ve el total de documentos pendientes
    Y el sistema tiene 5 documentos pendientes de firma
    Cuando la página carga las métricas
    Entonces el visitante debe ver la métrica "Pendientes de Firma: 5"

  @frontera @sistema-vacio
  Escenario: Visitante ve métricas en un sistema vacío
    Y el sistema no tiene usuarios ni documentos
    Cuando la página carga las métricas
    Entonces el visitante debe ver la métrica "Usuarios Totales: 0"
    Y el visitante debe ver la métrica "Documentos Gestionados: 0"
    Y el visitante debe ver la métrica "Pendientes de Firma: 0"

  @positivo
  Escenario: Visitante ve todas las métricas simultáneamente
    Y el sistema tiene 10 usuarios registrados
    Y el sistema tiene 25 documentos gestionados
    Y el sistema tiene 8 documentos pendientes de firma
    Cuando la página carga las métricas
    Entonces el visitante debe ver la métrica "Usuarios Totales: 10"
    Y el visitante debe ver la métrica "Documentos Gestionados: 25"
    Y el visitante debe ver la métrica "Pendientes de Firma: 8"
