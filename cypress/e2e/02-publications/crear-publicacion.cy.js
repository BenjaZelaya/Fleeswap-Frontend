describe('Crear publicación', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/publications/create')
  })

  it('valida los campos requeridos al enviar el formulario vacío', () => {
    cy.contains('button', /crear publicación/i).click()
    cy.contains(/el título es obligatorio/i).should('be.visible')
    cy.contains(/la categoría es obligatoria/i).should('be.visible')
    cy.contains(/el estado del objeto es obligatorio/i).should('be.visible')
    cy.contains(/seleccioná una localidad/i).should('be.visible')
    cy.contains(/la historia del objeto es obligatoria/i).should('be.visible')
    cy.url().should('include', '/publications/create')
  })

  it('exige precio cuando la modalidad no es trueque', () => {
    cy.get('input[name="title"]').type('Bicicleta rodado 26')
    cy.contains('span', /^venta$/i).click()
    cy.contains('button', /crear publicación/i).click()
    cy.contains(/el precio es obligatorio/i).should('be.visible')
  })

  it('deshabilita el precio cuando la modalidad es trueque', () => {
    cy.contains('span', /^trueque$/i).click()
    cy.get('input[name="price"]').should('be.disabled')
    cy.contains(/el precio no aplica para publicaciones de solo trueque/i).should('be.visible')
  })

  // El caso de éxito (creación real con foto) requiere subir una imagen vía
  // el widget de Cloudinary, que corre en un iframe de un tercero y no es
  // automatizable de forma confiable con Cypress. Las publicaciones usadas
  // por el resto de la suite se seedean directo contra la API real con
  // cy.seedPublication() (ver cypress/support/commands.js).
})
