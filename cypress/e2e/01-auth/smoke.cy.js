describe('smoke', () => {
  it('carga la pantalla de login', () => {
    cy.visit('/login')
    cy.contains(/iniciá sesión/i)
  })
})
