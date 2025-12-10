# language: es
@historial @trazabilidad
Característica: Desplegar historial de acciones
  Como usuario
  Quiero ver la trazabilidad de un documento
  Para auditar las acciones realizadas

  Antecedentes:
    Dado que el servidor está disponible

  @positivo
  Escenario: Visualización del historial de un documento firmado
    Y tengo un usuario autenticado como "USER"
    Y existe un documento que ha sido subido y firmado previamente
    Cuando envío una petición para ver el historial de ese documento
    Entonces la respuesta debe tener código 200
    Y la lista debe contener al menos 2 registros (Subida y Firma)
    Y el último registro debe indicar la acción "Signed" por el supervisor

  @negativo
  Escenario: Visualización de historial de documento inexistente
    Y tengo un usuario autenticado como "USER"
    Cuando envío una petición para ver el historial de un ID "no-existe-123"
    Entonces la respuesta debe tener código 404
    Y el mensaje debe indicar que el documento no fue encontrado
