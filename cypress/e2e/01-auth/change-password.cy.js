describe('Change password', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/change-password')
  })

  it('muestra error si la contraseña actual es incorrecta', () => {
    cy.get('input[name="passwordActual"]').type('ContraseñaIncorrecta1!')
    cy.get('input[name="passwordNueva"]').type('NuevaPassword123!')
    cy.get('input[name="confirm"]').type('NuevaPassword123!')
    cy.contains('button', /actualizar contraseña/i).click()
    cy.contains(/la contraseña actual es incorrecta/i).should('be.visible')
  })

  it('valida que la nueva contraseña y su confirmación coincidan', () => {
    cy.get('input[name="passwordActual"]').type(Cypress.env('testUserPassword'))
    cy.get('input[name="passwordNueva"]').type('NuevaPassword123!')
    cy.get('input[name="confirm"]').type('OtraPassword123!')
    cy.contains('button', /actualizar contraseña/i).click()
    cy.contains(/las contraseñas no coinciden/i).should('be.visible')
  })

  // El caso de éxito real cambia la contraseña del usuario seedeado, lo que
  // rompería los demás tests de login. Requiere el mecanismo de seed/reset
  // documentado en docs/TEST-PLAN.md antes de habilitarlo.
})
