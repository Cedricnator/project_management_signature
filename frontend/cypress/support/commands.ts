/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('loginAsAdmin', () => {
    const dummySession = {
        token: 'dummy-admin-token',
        account: {
            accountId: '1234',
            role: 'admin',
            username: 'Admin',
            email: 'admin@fake.cl',
        },
    }

    localStorage.setItem('session', JSON.stringify(dummySession))
})

Cypress.Commands.add('loginAsUser', () => {
    const dummySession = {
        token: 'dummy-user-token',
        account: {
            accountId: '1234',
            role: 'user',
            username: 'user',
            email: 'user@fake.cl',
        },
    }

    localStorage.setItem('session', JSON.stringify(dummySession))
})

Cypress.Commands.add('loginAsSupervisor', () => {
    const dummySession = {
        token: 'dummy-supervisor-token',
        account: {
            accountId: '1234',
            role: 'supervisor',
            username: 'supervisor',
            email: 'supervisor@fake.cl',
        },
    }

    localStorage.setItem('session', JSON.stringify(dummySession))
})

declare global {
    namespace Cypress {
        interface Chainable {
            loginAsAdmin(): Chainable<void>
            loginAsUser(): Chainable<void>
            loginAsSupervisor(): Chainable<void>
        }
    }
}

export {}
