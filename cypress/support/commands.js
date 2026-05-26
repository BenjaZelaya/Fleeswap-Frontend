const API = Cypress.env("API_URL") || "http://localhost:3000/api";

// ─── cy.apiRegister ──────────────────────────────────────────────────────────
// Registra un usuario vía API y retorna { user, email, password }
Cypress.Commands.add("apiRegister", (overrides = {}) => {
  const ts = Date.now();
  const defaults = {
    nombre: "Test",
    apellido: "User",
    email: `test_${ts}@cypress.local`,
    password: "Cypress123!",
    confirmPassword: "Cypress123!",
    fechaNacimiento: "1995-06-15",
  };
  const data = { ...defaults, ...overrides };

  return cy
    .request({ method: "POST", url: `${API}/auth/register`, body: data, failOnStatusCode: true })
    .then((res) => ({
      user: res.body.user ?? res.body,
      email: data.email,
      password: data.password,
    }));
});

// ─── cy.apiLogin ─────────────────────────────────────────────────────────────
// Hace login vía API, setea la cookie httpOnly en el browser y retorna el token
Cypress.Commands.add("apiLogin", (email, password) => {
  return cy
    .request({ method: "POST", url: `${API}/auth/login`, body: { email, password }, failOnStatusCode: true })
    .then((res) => res.body.accessToken);
});

// ─── cy.apiCreatePublication ─────────────────────────────────────────────────
// Crea una publicación para el usuario con el token dado. Retorna el objeto publicación.
Cypress.Commands.add("apiCreatePublication", (token, overrides = {}) => {
  const ts = Date.now();
  const defaults = {
    title: `Pub Test ${ts}`,
    description: "Descripción de prueba para test E2E de Cypress con mínimo de caracteres requeridos.",
    history: "Historia de prueba para test E2E de Cypress con mínimo de caracteres requeridos aquí.",
    category: "otros",
    condition: "bueno",
    type: "trueque",
    photos: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
  };
  const body = { ...defaults, ...overrides };

  return cy
    .request({
      method: "POST",
      url: `${API}/publications`,
      body,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: true,
    })
    .then((res) => res.body.publication ?? res.body);
});

// ─── cy.apiCreateExchange ─────────────────────────────────────────────────────
// Crea un intercambio como User A ofreciendo pubA pidiendo pubB. Retorna el exchange.
Cypress.Commands.add("apiCreateExchange", (tokenA, offeredPublicationId, requestedPublicationId) => {
  return cy
    .request({
      method: "POST",
      url: `${API}/exchanges`,
      body: { offeredPublicationId, requestedPublicationId, complementaryAmount: 0 },
      headers: { Authorization: `Bearer ${tokenA}` },
      failOnStatusCode: true,
    })
    .then((res) => res.body.exchange ?? res.body);
});

// ─── cy.apiAcceptExchange ─────────────────────────────────────────────────────
// User B acepta el intercambio. Retorna el exchange actualizado.
Cypress.Commands.add("apiAcceptExchange", (tokenB, exchangeId) => {
  return cy
    .request({
      method: "PATCH",
      url: `${API}/exchanges/${exchangeId}/accept`,
      headers: { Authorization: `Bearer ${tokenB}` },
      failOnStatusCode: true,
    })
    .then((res) => res.body.exchange ?? res.body);
});

// ─── cy.apiCleanup ────────────────────────────────────────────────────────────
// Limpia los datos de un test: publicaciones y usuarios
Cypress.Commands.add("apiCleanup", ({ tokens = [], publicationIds = [], userIds = [] }) => {
  // Eliminar publicaciones
  publicationIds.forEach((id, i) => {
    const token = tokens[i] ?? tokens[0];
    if (id && token) {
      cy.request({
        method: "DELETE",
        url: `${API}/publications/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    }
  });
  // Eliminar usuarios
  userIds.forEach((id, i) => {
    const token = tokens[i] ?? tokens[0];
    if (id && token) {
      cy.request({
        method: "DELETE",
        url: `${API}/users/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    }
  });
});

// ─── cy.setupActiveChat ───────────────────────────────────────────────────────
// Comando de alto nivel: crea dos usuarios, dos publicaciones, un intercambio activo.
// Retorna { tokenA, tokenB, userA, userB, pubA, pubB, exchange }
// Al final deja la sesión iniciada como User A (el que va a chatear como requester)
Cypress.Commands.add("setupActiveChat", () => {
  let tokenA, tokenB, userA, userB, pubA, pubB, exchange;
  // Guardamos las credenciales por separado porque el backend no devuelve la password en el user object
  let emailA, passwordA;

  return cy
    .apiRegister({ nombre: "Alice", apellido: "Test" })
    .then((a) => {
      userA = a.user;
      emailA = a.email;
      passwordA = a.password;
      return cy.apiLogin(a.email, a.password);
    })
    .then((t) => {
      tokenA = t;
      return cy.apiCreatePublication(tokenA);
    })
    .then((p) => {
      pubA = p;
      return cy.apiRegister({ nombre: "Bob", apellido: "Test" });
    })
    .then((b) => {
      userB = b.user;
      return cy.apiLogin(b.email, b.password);
    })
    .then((t) => {
      tokenB = t;
      return cy.apiCreatePublication(tokenB);
    })
    .then((p) => {
      pubB = p;
      return cy.apiCreateExchange(tokenA, pubA._id, pubB._id);
    })
    .then((ex) => {
      exchange = ex;
      return cy.apiAcceptExchange(tokenB, exchange._id);
    })
    .then(() => {
      // Re-login como A: obtener un token FRESCO para evitar invalidación por sesión múltiple
      return cy.apiLogin(emailA, passwordA);
    })
    .then((freshTokenA) => ({ tokenA: freshTokenA, tokenB, userA, userB, pubA, pubB, exchange }));
});

// ─── cy.loginForChatWith ─────────────────────────────────────────────────────
// Intercepta los dos endpoints que App.jsx llama al montar y devuelve
// el token REAL (no fake) para que las llamadas al backend funcionen.
// Esto evita depender del flujo de cookies httpOnly en Cypress, que puede
// quedar en estado incorrecto tras múltiples cy.apiLogin encadenados.
//
// Uso: cy.loginForChatWith(ctx.tokenA, ctx.userA)  → en beforeEach después de setupActiveChat
Cypress.Commands.add("loginForChatWith", (token, user) => {
  cy.intercept("POST", "**/auth/refresh", {
    statusCode: 200,
    body: { accessToken: token },
  }).as("refresh");

  cy.intercept("GET", "**/users/me", {
    statusCode: 200,
    body: user,
  }).as("getProfile");
});

// ─── cy.loginAs ──────────────────────────────────────────────────────────────
// Simula una sesión autenticada mockeando los dos endpoints que App.jsx
// llama al montar: POST /auth/refresh y GET /users/me
// No requiere backend real — funciona con datos ficticios.
//
// Uso: cy.loginAs({ id: '000000000000000000000001' })
// El test debe hacer cy.wait('@refresh') y cy.wait('@getProfile') después del cy.visit()
Cypress.Commands.add('loginAs', ({ id }) => {
  cy.intercept('POST', '**/auth/refresh', {
    statusCode: 200,
    body: { accessToken: 'fake-cypress-token' },
  }).as('refresh')

  cy.intercept('GET', '**/users/me', {
    statusCode: 200,
    body: {
      _id: id,
      id: id,
      nombre: 'Test',
      apellido: 'User',
      email: 'test@fleeswap.com',
      isVerified: true,
      role: 'user',
    },
  }).as('getProfile')
})
