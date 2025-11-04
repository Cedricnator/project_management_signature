# language: es
@signature
Característica: Firmar documento
  Como supervisor
  Quiero firmar un documento
  Para aprobarlo y cambiar su estado

  Antecedentes:
    Dado que el servidor está disponible
    Y existe un documento pendiente de revisión

  @positivo
  Escenario: Firma exitosa de documento
    Y tengo un usuario autenticado como "SUPERVISOR"
    Cuando envío una petición de firma con comentario "Documento revisado y aprobado"
    Entonces la respuesta debe tener código 201
    Y la firma debe ser registrada en la base de datos
    Y el estado del documento debe cambiar a "Approved"

  @negativo
  Escenario: Firma duplicada del mismo documento
    Y tengo un usuario autenticado como "SUPERVISOR"
    Dado que ya firmé el documento anteriormente
    Cuando envío una petición de firma nuevamente
    Entonces la respuesta debe tener código 400
    Y no debe crearse una nueva firma

  @negativo
  Escenario: Firma por usuario no supervisor
    Y tengo un usuario autenticado como "USER"
    Cuando envío una petición de firma
    Entonces la respuesta debe tener código 403

  @negativo
  Escenario: Firma de documento inexistente
    Y tengo un usuario autenticado como "SUPERVISOR"
    Cuando envío una petición de firma para un documento que no existe
    Entonces la respuesta debe tener código 404