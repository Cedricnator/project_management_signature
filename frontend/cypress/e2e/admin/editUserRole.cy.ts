describe('Admin changes user role', () => {
    beforeEach(() => {
        // Load the page and wait for initial documents
        cy.intercept('GET', '/users', { fixture: 'users.json' }).as('getUsers')
        cy.visit('/admin')
        cy.wait('@getUsers')
    })

    it('updates user role from user to supervisor', () => {
        const testUser = {
            email: 'juan.perez@signature.com',
            firstName: 'Juan',
            lastName: 'Pérez',
            role: 'user',
        }

        // Intercept PATCH request to change role
        cy.intercept('PATCH', '/users/change-role', (req) => {
            expect(req.body).to.deep.equal({
                email: testUser.email,
                newRole: 'supervisor',
            })

            req.reply({
                statusCode: 200,
            })
        }).as('changeRole')

        // Open modal for the specific user — this depends on how you open it
        cy.contains(testUser.email)
            .parents('tr')
            .within(() => {
                cy.contains('Editar').click()
            })

        // Modal should now be visible
        cy.get('[data-testid="create-user-modal"]').should('be.visible')

        // Select new role from dropdown
        cy.get('select').select('Supervisor') // assuming it's a native `<select>`, otherwise update selector

        // Submit the form
        cy.get('[data-testid="edit-role-button"]').click()

        // Wait for API call
        cy.wait('@changeRole')

        // Expect toast or modal close
        cy.contains('Usuario modificado con éxito').should('exist') // or wait for modal to disappear
        cy.get('[data-testid="create-user-modal"]').should('not.exist')
    })
})
