describe('Crear usuario', () => {
    beforeEach(() => {
        cy.loginAsAdmin()
        cy.intercept('GET', '/users', { fixture: 'users.json' }).as('getUsers')
        cy.visit('/admin')
        cy.wait('@getUsers')
    })

    it('should open modal, fill form, and submit user', () => {
        cy.contains('Crear usuario').click()

        cy.get('[data-testid="create-user-modal"]').should('be.visible')

        // Fill inputs
        cy.get('input#email').type('nuevo@usuario.cl')
        cy.get('input#fistName').type('Nuevo')
        cy.get('input#lastName').type('Usuario')
        cy.get('input#password').type('12345678')
        cy.get('input#confirm-password').type('12345678')

        // Select role from dropdown
        cy.get('select').select('Usuario')

        // Intercept the POST
        cy.intercept('POST', '/users', (req) => {
            expect(req.body).to.deep.equal({
                email: 'nuevo@usuario.cl',
                firstName: 'Nuevo',
                lastName: 'Usuario',
                password: '12345678',
                role: 'user', // Enum value
            })
            req.reply({
                statusCode: 201,
                body: {
                    email: 'nuevo@usuario.cl',
                    firstName: 'Nuevo',
                    lastName: 'Usuario',
                    role: 'user',
                },
            })
        }).as('createUser')

        // Click the submit button
        cy.get('[data-testid="create-user-button"]').click()

        // Check success toast (optional)
        cy.wait('@createUser')
        cy.contains('Usuario creado con éxito').should('exist')
    })
})
