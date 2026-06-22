describe('Persistencia de sesión', () => {
  it('mantiene la sesión luego de refrescar la página', () => {
    cy.login()
    cy.reload()
    cy.url().should('not.include', '/login')
    cy.get('[data-testid="avatar-menu-trigger"]').should('be.visible')
  })

  it('redirige a login al intentar acceder a una ruta protegida sin sesión', () => {
    cy.visit('/edit-profile')
    cy.url().should('include', '/login')
  })
})
