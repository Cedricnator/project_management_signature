describe('Basic admin dashboard functionality', () => {
    beforeEach(() => {
        cy.loginAsAdmin()
        cy.intercept('GET', '/users', { fixture: 'users.json' }).as('getUsers')
        cy.visit('/admin')
        cy.wait('@getUsers')
    })

    it('shows users when API responds', () => {
        cy.get('table').should('exist')
        cy.contains('admin@signature.com').should('exist')
    })

    it('shows empty message when no users', () => {
        cy.intercept('GET', '/users', []).as('getUsers')
        cy.visit('/admin')
        cy.wait('@getUsers')

        cy.contains('No hay usuarios disponibles').should('exist')
    })

    it('filters users by email', () => {
        cy.get('#table-search').type('admin')
        cy.contains('admin@signature.com').should('exist')
        cy.contains('caramelo@example.com').should('not.exist')
    })

    it('sorts users by role', () => {
        cy.contains('Rol').click()
    })

    it('opens create user modal', () => {
        cy.contains('Crear usuario').click()
        cy.get('[data-testid="create-user-modal"]').should('be.visible')
    })

    it('navigates to next page', () => {
        cy.contains('Siguiente').click()
    })
})
