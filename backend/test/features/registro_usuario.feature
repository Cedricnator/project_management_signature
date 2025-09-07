# language: es
Característica: Registro de usuario
  Como administrador
  Quiero registrar nuevos usuarios
  Para que puedan acceder al sistema

  Antecedentes:
    Cuando el servidor esta disponible

  @positivo
  Escenario: Registro exitoso de usuario
    Cuando envío una petición de registro con:
      | email               | password  | firstName | lastName | role |
      | usuario@example.com | P4ssw0rd  | Test      | User     | USER |
    Entonces la respuesta debe tener código 201
    Y la respuesta debe incluir el email "usuario@example.com"

  @negativo @sin-token
  Escenario: Intento de registro sin token (no autorizado)
    Cuando envío una petición de registro con:
      | email                 | password | firstName | lastName | role |
      | sin-token@example.com | P4ssw0rd | Test      | User     | USER |
    Entonces la respuesta debe tener código 401

  @negativo
  Escenario: Registro con email ya existente
    Cuando envío una petición de registro con:
      | email               | password  | firstName | lastName | role |
      | existing@example.com | P4ssw0rd  | Test      | User     | USER |
    Entonces la respuesta debe tener código 409

  @negativo
  Escenario: Password demasiado corta (validación)
    Cuando envío una petición de registro con:
      | email                 | password | firstName | lastName | role |
      | corta@example.com     | p4S!     | Test      | User     | USER |
    Entonces la respuesta debe tener código 400

  @frontera @password-minimo
  Escenario: Password en el límite mínimo (aceptado)
    Cuando envío una petición de registro con:
      | email                  | password | firstName | lastName | role |
      | limite@example.com     | P4ssw0   | Test      | User     | USER |
    Entonces la respuesta debe tener código 201
