Cypress.Commands.add('login', ({ email, password } = {}) => {
  const user = {
    email: email ?? Cypress.env('testUserEmail'),
    password: password ?? Cypress.env('testUserPassword'),
  }
  cy.visit('/login')
  cy.get('input[name="email"]').type(user.email)
  cy.get('input[name="password"]').type(user.password)
  cy.contains('button', /iniciá sesión/i).click()
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('apiLogin', ({ email, password } = {}) => {
  return cy.request('POST', '/api/auth/login', {
    email: email ?? Cypress.env('testUserEmail'),
    password: password ?? Cypress.env('testUserPassword'),
  }).then((res) => res.body.accessToken)
})

Cypress.Commands.add('seedPublication', (overrides = {}) => {
  return cy.apiLogin().then((token) => {
    return cy.request({
      method: 'POST',
      url: '/api/publications',
      auth: { bearer: token },
      body: {
        title: `Publicación de prueba ${Date.now()}`,
        description: 'Descripción de prueba generada por Cypress',
        history: 'Historia de prueba generada por Cypress con suficiente longitud para pasar validación',
        category: 'otros',
        condition: 'bueno',
        type: 'venta',
        price: 1000,
        photos: ['https://picsum.photos/seed/cypress/400'],
        location: 'San Miguel de Tucumán',
        ...overrides,
      },
    }).then((res) => res.body)
  })
})

Cypress.Commands.add('apiDeletePublication', (id) => {
  return cy.apiLogin().then((token) => {
    return cy.request({
      method: 'DELETE',
      url: `/api/publications/${id}`,
      auth: { bearer: token },
      body: { confirmacion: true },
      failOnStatusCode: false,
    })
  })
})
