describe('Login', () => {
  const email = Cypress.env('testUserEmail')
  const password = Cypress.env('testUserPassword')

  beforeEach(() => {
    cy.visit('/login')
  })

  it('inicia sesión con credenciales válidas', () => {
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.contains('button', /iniciá sesión/i).click()
    cy.url().should('not.include', '/login')
  })

  it('muestra error con credenciales inválidas', () => {
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type('ContraseñaIncorrecta1!')
    cy.contains('button', /iniciá sesión/i).click()
    cy.contains(/email o contraseña incorrectos/i).should('be.visible')
    cy.url().should('include', '/login')
  })

  it('muestra estado de carga durante el submit', () => {
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.contains('button', /iniciá sesión/i).click()
    cy.contains('button', /ingresando/i).should('be.visible')
  })

  it('navega a forgot-password desde el link', () => {
    cy.contains(/olvidaste tu contraseña/i).click()
    cy.url().should('include', '/forgot-password')
  })
})
