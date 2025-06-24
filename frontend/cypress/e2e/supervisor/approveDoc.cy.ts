describe('Supervisor document reject', () => {
    beforeEach(() => {
        cy.loginAsSupervisor()
        cy.intercept('GET', '/files', { fixture: 'documents.json' }).as('getDocs')
        cy.visit('/supervisor')
        cy.wait('@getDocs')
    })

    it('should approve document and update doc history', () => {
        cy.contains('HOPE DRIVEN DEVELOPMENT')
            .parents('tr')
            .within(() => {
                cy.contains('Procesar').click()
            })

        cy.fixture('signature-response.json').then((signatureResponse) => {
            cy.intercept('POST', '/signature', { statusCode: 201, body: signatureResponse }).as(
                'approveDoc',
            )
        })

        cy.get('[data-testid="approve-document-button"]').click()
        cy.wait('@approveDoc')

        cy.contains('HOPE DRIVEN DEVELOPMENT')
            .parents('tr')
            .within(() => {
                cy.contains('Aprobado').should('exist')
            })

        cy.fixture('doc-history.json').then((docHistory) => {
            cy.intercept('GET', '/files/*/history', {
                statusCode: 200,
                body: docHistory,
            }).as('docHistory')
        })

        cy.contains('HOPE DRIVEN DEVELOPMENT')
            .parents('tr')
            .within(() => {
                cy.contains('Ver historial').click()
            })
        cy.wait('@docHistory')

        cy.contains('Aprobado').should('exist')
    })
})
