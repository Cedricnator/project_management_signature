# language: es
@usuarios @admin
Característica: Desplegar usuarios
  Como administrador
  Quiero listar los usuarios del sistema
  Para gestionar el control de acceso

  Antecedentes:
    Dado que el servidor está disponible
    Y existen usuarios registrados con diferentes roles

  @positivo
  Escenario: Administrador lista todos los usuarios
    Y tengo un usuario autenticado como "ADMIN"
    Cuando envío una petición para listar usuarios
    Entonces la respuesta debe tener código 200
    Y la respuesta debe ser una lista de objetos de usuario
    Y cada usuario debe mostrar su "email" y "role"

  @negativo @autorizacion
  Escenario: Usuario normal intenta listar usuarios
    Y tengo un usuario autenticado como "USER"
    Cuando envío una petición para listar usuarios
    Entonces la respuesta debe tener código 403
    Y el mensaje debe indicar falta de permisos de administrador
