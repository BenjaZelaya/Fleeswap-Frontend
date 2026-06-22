function uniqueEmail() {
  return `cy.test.${Date.now()}@fleeswap.dev`
}

describe('Register', () => {
  beforeEach(() => {
    cy.visit('/register')
  })

  it('registra una cuenta nueva con datos válidos', () => {
    cy.get('input[name="nombre"]').type('Cypress')
    cy.get('input[name="apellido"]').type('Tester')
    cy.get('input[name="fechaNacimiento"]').type('2000-01-01')
    cy.get('input[name="email"]').type(uniqueEmail())
    cy.get('input[name="password"]').type('Password123!')
    cy.get('input[name="confirm"]').type('Password123!')
    cy.contains('button', /crear cuenta/i).click()
    cy.url().should('not.include', '/register')
  })

  it('muestra error si el email ya está en uso', () => {
    cy.get('input[name="nombre"]').type('Cypress')
    cy.get('input[name="apellido"]').type('Tester')
    cy.get('input[name="fechaNacimiento"]').type('2000-01-01')
    cy.get('input[name="email"]').type(Cypress.env('testUserEmail'))
    cy.get('input[name="password"]').type('Password123!')
    cy.get('input[name="confirm"]').type('Password123!')
    cy.contains('button', /crear cuenta/i).click()
    cy.contains(/el email ya está en uso/i).should('be.visible')
  })

  it('valida campos requeridos en el cliente', () => {
    cy.contains('button', /crear cuenta/i).click()
    cy.contains(/el nombre es obligatorio/i).should('be.visible')
    cy.contains(/el apellido es obligatorio/i).should('be.visible')
    cy.contains(/la fecha de nacimiento es obligatoria/i).should('be.visible')
  })

  it('valida que las contraseñas coincidan', () => {
    cy.get('input[name="nombre"]').type('Cypress')
    cy.get('input[name="apellido"]').type('Tester')
    cy.get('input[name="fechaNacimiento"]').type('2000-01-01')
    cy.get('input[name="email"]').type(uniqueEmail())
    cy.get('input[name="password"]').type('Password123!')
    cy.get('input[name="confirm"]').type('Otra123!')
    cy.contains('button', /crear cuenta/i).click()
    cy.contains(/las contraseñas no coinciden/i).should('be.visible')
  })
})
