# language: es
@document
Característica: Crear documento
  Como usuario
  Quiero subir un documento
  Para que pueda ser firmado por supervisores

  Antecedentes:
    Dado que el servidor está disponible

  @positivo
  Escenario: Subida exitosa de documento
    Y tengo un usuario autenticado como "USER"
    Cuando envío una petición de subida de documento con:
      | name          | description            | filename |
      | Test Document | Document for testing   | test.pdf |
    Entonces la respuesta debe tener código 201
    Y la respuesta debe incluir el nombre "Test Document"
    Y el documento debe estar en estado "Pending Review"

  @negativo
  Escenario: Subida fallida por archivo no válido
    Y tengo un usuario autenticado como "USER"
    Cuando envío una petición de subida de documento con archivo inválido
    Entonces la respuesta debe tener código 400

  @negativo @sin-autenticacion
  Escenario: Subida sin autenticación
    Cuando envío una petición de subida de documento sin token
    Entonces la respuesta debe tener código 401