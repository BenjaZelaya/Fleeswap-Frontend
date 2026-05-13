describe('PublicationDetail — Sección del vendedor', () => {
  const OWNER_ID = '000000000000000000000001'
  const OTHER_ID = '000000000000000000000002'
  const PUB_ID   = 'bbbbbbbbbbbbbbbbbbbbbbbb'

  const mockOwner = {
    _id: OWNER_ID,
    nombre: 'Marta',
    apellido: 'Gomez',
    email: 'marta@fleeswap.com',
    isVerified: true,
    location: 'Tucumán',
    bio: 'Coleccionista de libros.',
    photo: null,
  }

  const mockPublication = {
    _id: PUB_ID,
    title: 'El nombre de la rosa',
    description: 'Muy buen estado, poco uso.',
    status: 'available',
    category: 'libros_comics',
    condition: 'bueno',
    type: 'trueque',
    photos: [],
    location: 'Tucumán',
    createdAt: new Date().toISOString(),
    owner: mockOwner,
  }

  beforeEach(() => {
    cy.loginAs({ id: OTHER_ID })

    cy.intercept('GET', `**/api/publications/${PUB_ID}`, {
      statusCode: 200,
      body: mockPublication,
    }).as('getPublication')
  })

  it('FE-04 — click en el nombre del vendedor navega a /profile/:id', () => {
    cy.visit(`/publications/${PUB_ID}`)
    cy.wait('@refresh')
    cy.wait('@getProfile')
    cy.wait('@getPublication')

    cy.contains('a', 'Marta Gomez').click()

    cy.url().should('include', `/profile/${OWNER_ID}`)
  })

  it('FE-05 — click en "Ver perfil" navega a /profile/:id', () => {
    cy.visit(`/publications/${PUB_ID}`)
    cy.wait('@refresh')
    cy.wait('@getProfile')
    cy.wait('@getPublication')

    cy.contains('Ver perfil').click()

    cy.url().should('include', `/profile/${OWNER_ID}`)
  })

  it('FE-06 — vendedor verificado: muestra el badge "Verificado"', () => {
    cy.visit(`/publications/${PUB_ID}`)
    cy.wait('@refresh')
    cy.wait('@getProfile')
    cy.wait('@getPublication')

    cy.contains('Verificado').should('be.visible')
  })

  it('FE-07 — vendedor no verificado: no muestra el badge "Verificado"', () => {
    cy.intercept('GET', `**/api/publications/${PUB_ID}`, {
      statusCode: 200,
      body: {
        ...mockPublication,
        owner: { ...mockOwner, isVerified: false },
      },
    }).as('getPublication')

    cy.visit(`/publications/${PUB_ID}`)
    cy.wait('@refresh')
    cy.wait('@getProfile')
    cy.wait('@getPublication')

    cy.contains('Verificado').should('not.exist')
  })

})