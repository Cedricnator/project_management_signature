describe('Upload document modal', () => {
    beforeEach(() => {
        cy.loginAsUser()
        cy.intercept('GET', '/files/users/*', []).as('getUserDocs')
        cy.visit('/user')
        cy.wait('@getUserDocs')
    })

    it('uploads a document with metadata', () => {
        cy.contains('Agregar documento').click()

        cy.get('#crud-modal').should('be.visible')

        // Fill out form fields
        cy.get('input#name').type('Certificado de notas')
        cy.get('textarea#description').type('Documento oficial con mis notas del semestre.')
        cy.get('textarea#commentary').type('Importante para la postulación.')

        // Intercept FormData POST request
        cy.intercept('POST', '/files/upload/', (req) => {
            // FormData is not visible directly in Cypress, so we can't assert body
            req.reply({
                statusCode: 201,
                body: {
                    fileId: '123',
                    name: 'Certificado de notas',
                    description: 'Documento oficial con mis notas del semestre.',
                    commentary: 'Importante para la postulación.',
                    uploadDate: new Date(),
                },
            })
        }).as('uploadDocument')

        // Upload a test PDF
        cy.get('input[type=file]').selectFile('./cypress/fixtures/dummy.pdf', { force: true })

        // Submit the form
        cy.contains('Agregar documento').click()

        // Wait for the request and assert success
        cy.wait('@uploadDocument').its('response.statusCode').should('eq', 201)

        // Modal should close
        cy.get('#crud-modal').should('not.exist')
    })
})
