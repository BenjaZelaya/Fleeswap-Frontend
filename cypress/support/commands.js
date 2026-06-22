Cypress.Commands.add('login', ({ email, password }) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.contains('button', /iniciá sesión/i).click()
})
