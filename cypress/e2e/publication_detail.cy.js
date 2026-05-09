describe('PublicationDetail — control de acceso por ownership', () => {

  const OWNER_ID = '000000000000000000000001'
  const PUB_ID   = 'aaaaaaaaaaaaaaaaaaaaaaaa'

  const mockPublication = {
    _id: PUB_ID,
    title: 'Bicicleta de montaña',
    description: 'Rodado 29, muy buen estado.',
    status: 'available',
    category: 'sports',
    condition: 'used',
    type: 'exchange',
    photos: [],
    location: 'Tucumán',
    createdAt: new Date().toISOString(),
    owner: {
      _id: OWNER_ID,
      nombre: 'Test',
      apellido: 'User',
      email: 'test@fleeswap.com',
      isVerified: true,
    },
  }

  beforeEach(() => {
    // Autenticamos como el dueño de la publicación
    cy.loginAs({ id: OWNER_ID })

    // Interceptamos la carga de la publicación
    cy.intercept('GET', `**/api/publications/${PUB_ID}`, {
      statusCode: 200,
      body: mockPublication,
    }).as('getPublication')
  })

  it('FE-01 — usuario dueño: no ve botones de acción, ve aviso de propiedad', () => {
    cy.visit(`/publications/${PUB_ID}`)

    cy.wait('@refresh')
    cy.wait('@getProfile')
    cy.wait('@getPublication')

    // El bloque azul de "Esta es tu publicación" debe estar visible
    cy.contains('Esta es tu publicación').should('be.visible')

    // Los botones de acción NO deben existir en el DOM
    cy.contains('Comprar ahora').should('not.exist')
    cy.contains('Me interesa').should('not.exist')
    cy.contains('Proponer Intercambio').should('not.exist')
  })

  it('FE-02 — usuario no dueño: ve los botones de acción', () => {
  const OTRO_USER_ID = '000000000000000000000002'

  // Autenticamos como un usuario diferente al dueño
  cy.loginAs({ id: OTRO_USER_ID })

  cy.visit(`/publications/${PUB_ID}`)

  cy.wait('@refresh')
  cy.wait('@getProfile')
  cy.wait('@getPublication')

  // El aviso de propiedad NO debe existir
  cy.contains('Esta es tu publicación').should('not.exist')

  // Los botones de acción SÍ deben estar en el DOM
  cy.contains('Comprar ahora').should('exist')
  cy.contains('Me interesa').should('exist')
})

    it('FE-03 — publicación no encontrada: muestra estado vacío', () => {
    cy.loginAs({ id: '000000000000000000000001' })

    cy.intercept('GET', `**/api/publications/${PUB_ID}`, {
        statusCode: 404,
        body: { message: 'Publicación no encontrada' },
    }).as('getPublicationNotFound')

    cy.visit(`/publications/${PUB_ID}`)

    cy.wait('@refresh')
    cy.wait('@getProfile')
    cy.wait('@getPublicationNotFound')

    cy.contains('Publicación no encontrada').should('be.visible')
    cy.contains('Esta publicación no existe o fue eliminada.').should('be.visible')
    cy.contains('Volver al inicio').should('be.visible')
    })

})