# language: es
@landing
Característica: Dashboard de métricas en la página de bienvenida
  Como un visitante, 
  Quiero ver el dashboard en la página de bienvenida con las métricas clave del sistema, 
  Para entender la actividad y la carga de trabajo actual de la plataforma.


  Antecedentes:
    Dado que un visitante accede a la página principal

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