describe('Reset password', () => {
  it('muestra link inválido si no hay token en la URL', () => {
    cy.visit('/reset-password')
    cy.contains(/link inválido/i).should('be.visible')
    cy.contains(/solicitar un nuevo link/i).should('be.visible')
  })

  it('muestra error si el token es inválido o expiró', () => {
    cy.visit('/reset-password?token=token-invalido-de-prueba')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('input[name="confirm"]').type('Password123!')
    cy.contains('button', /restablecer contraseña/i).click()
    cy.contains(/el link expiró o ya fue utilizado/i).should('be.visible')
  })

  it('valida que las contraseñas coincidan', () => {
    cy.visit('/reset-password?token=token-invalido-de-prueba')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('input[name="confirm"]').type('Otra123!')
    cy.contains('button', /restablecer contraseña/i).click()
    cy.contains(/las contraseñas no coinciden/i).should('be.visible')
  })

  // El caso de token válido requiere un token real emitido por el backend
  // (vía /auth/forgot-password contra un email seedeado). No es automatizable
  // sin un hook de test en el backend que expicite el token generado.
})
