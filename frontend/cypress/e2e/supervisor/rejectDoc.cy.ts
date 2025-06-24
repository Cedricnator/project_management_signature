describe('Supervisor document reject', () => {
    beforeEach(() => {
        cy.loginAsSupervisor()
        cy.intercept('GET', '/files', { fixture: 'documents.json' }).as('getDocs')
        cy.visit('/supervisor')
        cy.wait('@getDocs')
    })

    it('should reject document', () => {
        cy.contains('HOPE DRIVEN DEVELOPMENT')
            .parents('tr')
            .within(() => {
                cy.contains('Procesar').click()
            })

        cy.intercept('PATCH', '/files/*/status', (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    id: 'b2797660-d82a-457d-aee3-883f01477fe9',
                    name: 'HOPE DRIVEN DEVELOPMENT',
                    description: 'HOPE DRIVEN DEVELOPMENT',
                    currentStatusId: '01974b23-e943-7308-8185-1556429b9ff1',
                    filePath: 'uploads/Manual Spring Boot.pdf-1750303311237-489178220.pdf',
                    fileSize: '3056069',
                    mimetype: 'application/pdf',
                    originalFilename: 'Manual Spring Boot.pdf',
                    filename: 'Manual Spring Boot.pdf-1750303311237-489178220.pdf',
                    createdAt: '2025-06-19T03:21:51.340Z',
                    updatedAt: '2025-06-19T03:22:04.921Z',
                    uploadedBy: '01974b59-7d0e-7745-b45a-5a36316863e6',
                },
            })
        }).as('rejectDoc')

        cy.get('[data-testid="reject-document-button"]').click()
        cy.wait('@rejectDoc')

        cy.contains('HOPE DRIVEN DEVELOPMENT')
            .parents('tr')
            .within(() => {
                cy.contains('Rechazado').should('exist')
            })
    })
})
