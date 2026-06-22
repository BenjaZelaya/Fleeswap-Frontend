describe('Detalle de publicación', () => {
  let publication

  before(() => {
    cy.seedPublication({ type: 'ambos', price: 5000 }).then((pub) => {
      publication = pub
    })
  })

  after(() => {
    if (publication) cy.apiDeletePublication(publication._id)
  })

  beforeEach(() => {
    // cy.seedPublication hace login por API, lo que deja una cookie de sesión
    // real en el browser. Hay que limpiarla para simular un visitante anónimo.
    cy.clearCookies()
  })

  it('muestra la info básica para un visitante sin sesión', () => {
    cy.visit(`/publications/${publication._id}`)
    cy.contains(publication.title).should('be.visible')
    cy.contains('button', /comprar ahora/i).should('be.visible')
    cy.contains('button', /me interesa \(intercambio\)/i).should('be.visible')
  })

  it('redirige a login si un visitante sin sesión intenta comprar', () => {
    cy.visit(`/publications/${publication._id}`)
    cy.contains('button', /comprar ahora/i).click()
    cy.url().should('include', '/login')
  })

  it('muestra el banner de "es tu publicación" para el dueño', () => {
    cy.login()
    cy.visit(`/publications/${publication._id}`)
    cy.contains(/esta es tu publicación/i).should('be.visible')
    cy.contains('button', /comprar ahora/i).should('not.exist')
  })

  it('muestra "publicación no encontrada" para un id inexistente', () => {
    cy.visit('/publications/000000000000000000000000')
    cy.contains(/publicación no encontrada/i).should('be.visible')
  })
})
