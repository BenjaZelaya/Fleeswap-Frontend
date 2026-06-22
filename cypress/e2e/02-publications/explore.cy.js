describe('Explorar publicaciones', () => {
  let publication

  before(() => {
    cy.seedPublication({ category: 'electronica', condition: 'nuevo' }).then((pub) => {
      publication = pub
    })
  })

  after(() => {
    if (publication) cy.apiDeletePublication(publication._id)
  })

  it('muestra la publicación seedeada en el listado general', () => {
    cy.visit('/explore')
    cy.contains(publication.title).should('be.visible')
  })

  it('encuentra la publicación por búsqueda de texto', () => {
    cy.visit('/explore')
    cy.get('input[type="search"]').type(publication.title)
    cy.contains('button', /^buscar$/i).click()
    cy.contains(publication.title).should('be.visible')
  })

  it('filtra por categoría y mantiene la publicación esperada', () => {
    cy.visit('/explore')
    cy.get('#filter-category').select('electronica')
    cy.contains(publication.title).should('be.visible')
  })

  it('no encuentra resultados con un filtro de categoría que no aplica', () => {
    cy.visit('/explore')
    cy.get('#filter-category').select('musica')
    cy.contains(publication.title).should('not.exist')
  })
})
