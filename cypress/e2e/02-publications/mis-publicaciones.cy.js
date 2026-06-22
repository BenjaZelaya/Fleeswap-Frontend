describe('Mis publicaciones', () => {
  let publication

  beforeEach(() => {
    cy.seedPublication().then((pub) => {
      publication = pub
      cy.login()
      cy.visit('/my-publications')
    })
  })

  afterEach(() => {
    if (publication) cy.apiDeletePublication(publication._id)
  })

  it('lista la publicación recién creada', () => {
    cy.contains('tr', publication.title).within(() => {
      cy.contains(/^activa$/i).should('be.visible')
    })
  })

  it('navega a editar desde el link de la publicación', () => {
    cy.contains('tr', publication.title).within(() => {
      cy.get('a[href$="/edit"]').click()
    })
    cy.url().should('include', `/publications/${publication._id}/edit`)
  })

  it('pausa y reactiva la disponibilidad', () => {
    cy.contains('tr', publication.title).find('button[title="Marcar como no disponible"]').click()
    cy.contains('button', /confirmar/i).click()
    cy.contains('tr', publication.title).within(() => {
      cy.contains(/no disponible/i).should('be.visible')
    })
  })

  it('elimina la publicación con confirmación', () => {
    cy.contains('tr', publication.title).find('button[title="Eliminar"]').click()
    // Scopeado al modal: la tarjeta mobile (oculta en este viewport) también
    // tiene un botón con texto "Eliminar" y cy.contains() matchea elementos
    // ocultos, así que hay que acotar al diálogo para no clickear el equivocado.
    cy.get('[role="dialog"]').contains('button', /^eliminar$/i).click()
    cy.contains(publication.title).should('not.exist')
    publication = null // ya fue borrada, no reintentar limpieza
  })
})
