# language: es
@documentos @listado
Característica: Desplegar documentos
  Como usuario autenticado
  Quiero visualizar la lista de documentos
  Para acceder a la información disponible

  Antecedentes:
    Dado que el servidor está disponible
    Y existen documentos almacenados en la base de datos

  @positivo
  Escenario: Visualización exitosa de la lista de documentos
    Y tengo un usuario autenticado como "USER"
    Cuando envío una petición para listar documentos
    Entonces la respuesta debe tener código 200
    Y la respuesta debe contener una lista de archivos
    Y cada elemento de la lista debe incluir "name", "status" y "uploadedBy"

  @positivo @filtro
  Escenario: Filtrar documentos por nombre
    Y tengo un usuario autenticado como "USER"
    Cuando envío una petición para buscar documentos con el término "Planilla"
    Entonces la respuesta debe tener código 200
    Y los documentos listados deben contener "Planilla" en su nombre

  @negativo @sin-autenticacion
  Escenario: Intento de listar documentos sin sesión
    Cuando envío una petición para listar documentos sin token
    Entonces la respuesta debe tener código 401
