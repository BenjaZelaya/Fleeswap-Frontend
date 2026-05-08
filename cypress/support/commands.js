Cypress.Commands.add('loginAs', (userOverrides = {}) => {
  const defaultUser = {
    id: '000000000000000000000001',
    nombre: 'Test',
    apellido: 'User',
    email: 'test@fleeswap.com',
    role: 'user',
    isVerified: true,
    ...userOverrides,
  }
  const fakeToken = 'fake-access-token-cypress'

  // Zustand persist lee 'fleeswap-auth' de localStorage al montar.
  // Solo persiste { user }, nunca el token — igual que el store real.
  localStorage.setItem(
    'fleeswap-auth',
    JSON.stringify({ state: { user: defaultUser }, version: 0 })
  )

  // Interceptamos el refresh que App.jsx dispara al montar.
  // Sin esto, App.jsx llama al backend real, falla, y authReady
  // nunca pone el token en memoria → todas las llamadas son 401.
  cy.intercept('POST', '**/api/auth/refresh', {
    statusCode: 200,
    body: { accessToken: fakeToken },
  }).as('refresh')

  // Interceptamos el profile/me que App.jsx llama después del refresh.
  cy.intercept('GET', '**/api/users/me', {
    statusCode: 200,
    body: defaultUser,
  }).as('getProfile')
})
