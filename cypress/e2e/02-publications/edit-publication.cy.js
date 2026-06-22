describe('Editar publicación', () => {
  let publication

  beforeEach(() => {
    cy.seedPublication().then((pub) => {
      publication = pub
      cy.login()
      cy.visit(`/publications/${publication._id}/edit`)
    })
  })

  afterEach(() => {
    if (publication) cy.apiDeletePublication(publication._id)
  })

  it('precarga el formulario con los datos existentes', () => {
    cy.get('input[name="title"]').should('have.value', publication.title)
  })

  it('el botón de guardar está deshabilitado sin cambios', () => {
    cy.contains('button', /guardar cambios/i).should('be.disabled')
    cy.contains(/realizá algún cambio para poder guardar/i).should('be.visible')
  })

  it('edita el título y guarda los cambios', () => {
    // El backend descarta price/location al crear (ver known_issues), así que
    // el formulario de edición siempre los precarga vacíos y los exige de
    // nuevo como obligatorios antes de poder guardar cualquier cambio.
    const newTitle = `${publication.title} (editado)`
    cy.get('input[name="title"]').clear().type(newTitle)
    cy.get('input[name="price"]').clear().type('1500')
    cy.get('#location-select').type('San Miguel{enter}')
    cy.contains('button', /guardar cambios/i).should('not.be.disabled').click()
    cy.url().should('include', '/my-publications')
    cy.contains('tr', newTitle).should('be.visible')
  })
})
