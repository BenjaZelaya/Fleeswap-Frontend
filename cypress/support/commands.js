Cypress.Commands.add('login', ({ email, password } = {}) => {
  const user = {
    email: email ?? Cypress.env('testUserEmail'),
    password: password ?? Cypress.env('testUserPassword'),
  }
  cy.visit('/login')
  cy.get('input[name="email"]').type(user.email)
  cy.get('input[name="password"]').type(user.password)
  cy.contains('button', /iniciá sesión/i).click()
  cy.url().should('not.include', '/login')
})
