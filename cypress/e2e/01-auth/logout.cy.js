describe('Logout', () => {
  beforeEach(() => {
    cy.login()
    cy.get('[data-testid="avatar-menu-trigger"]').click()
    cy.contains('button', /cerrar sesión/i).click()
  })

  it('cancelar el modal no cierra la sesión', () => {
    cy.contains('button', /cancelar/i).click()
    cy.contains(/cerrar sesión\?/i).should('not.exist')
    cy.reload()
    cy.url().should('not.include', '/login')
  })

  it('confirmar el modal cierra la sesión y redirige a login', () => {
    cy.contains('button', /sí, salir/i).click()
    cy.url().should('include', '/login')
  })
})
