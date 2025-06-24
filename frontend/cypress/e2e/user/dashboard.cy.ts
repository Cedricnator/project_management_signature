it('shows docs when API responds', () => {
    cy.intercept('GET', '/files/users/*', { fixture: 'documents.json' }).as('getDocs')
    cy.visit('/user')
    cy.wait('@getDocs')

    cy.get('table').should('exist')
    cy.contains('MANUAL SPRINGTO BOOT').should('exist')
})
