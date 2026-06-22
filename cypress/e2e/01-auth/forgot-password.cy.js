describe('Forgot password', () => {
  beforeEach(() => {
    cy.visit('/forgot-password')
  })

  it('muestra confirmación de envío para un email existente', () => {
    cy.get('input[type="email"]').type(Cypress.env('testUserEmail'))
    cy.contains('button', /enviar instrucciones/i).click()
    cy.contains(/revisá tu email/i).should('be.visible')
  })

  it('muestra el mismo mensaje genérico para un email inexistente (no filtra info)', () => {
    cy.get('input[type="email"]').type('no-existe@fleeswap.dev')
    cy.contains('button', /enviar instrucciones/i).click()
    cy.contains(/revisá tu email/i).should('be.visible')
  })

  it('valida que el email sea obligatorio', () => {
    cy.contains('button', /enviar instrucciones/i).click()
    cy.contains(/el email es obligatorio/i).should('be.visible')
  })
})
