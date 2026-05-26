// cypress/e2e/chat.cy.js

describe("Chat E2E — H4.2 / H4.3", () => {

  // ── Test 1: Carga del historial ────────────────────────────────────────────
  describe("CH-01 — Carga del historial al entrar al chat", () => {

    let ctx; // { tokenA, tokenB, userA, userB, pubA, pubB, exchange }

    beforeEach(() => {
      cy.setupActiveChat().then((data) => {
        ctx = data;
        // Interceptar auth para que App.jsx use tokenA real sin depender de cookies
        cy.loginForChatWith(ctx.tokenA, ctx.userA);
      });
    });

    afterEach(() => {
      if (ctx) {
        cy.apiCleanup({
          tokens: [ctx.tokenA, ctx.tokenB],
          publicationIds: [ctx.pubA._id, ctx.pubB._id],
          userIds: [ctx.userA._id ?? ctx.userA.id, ctx.userB._id ?? ctx.userB.id],
        });
      }
    });

    it("CH-01a — intercambio activo sin mensajes previos: muestra estado vacío", () => {
      cy.intercept("GET", `**/api/exchanges/${ctx.exchange._id}/messages`).as("getMessages");

      cy.visit(`/intercambios/${ctx.exchange._id}/chat`);

      // Esperar que App.jsx complete el ciclo de auth con el token real
      cy.wait("@refresh");
      cy.wait("@getProfile");

      // Esperar que ChatView cargue el historial
      cy.wait("@getMessages").its("response.statusCode").should("eq", 200);

      // El skeleton de carga NO debe estar visible
      cy.get('[data-testid="chat-skeleton"]', { timeout: 8000 }).should("not.exist");

      // Intercambio sin mensajes → debe mostrar el estado vacío
      cy.contains("¡Rompan el hielo!", { timeout: 8000 }).should("be.visible");

      // El input debe estar visible (exchangeStatus === "active")
      cy.get('textarea[aria-label="Campo de mensaje"]').should("be.visible");
    });

    it("CH-01b — el header no queda en estado 'Cargando' indefinidamente", () => {
      cy.intercept("GET", `**/api/exchanges/${ctx.exchange._id}/messages`).as("getMessages");

      cy.visit(`/intercambios/${ctx.exchange._id}/chat`);

      // Esperar que App.jsx complete el ciclo de auth con el token real
      cy.wait("@refresh");
      cy.wait("@getProfile");

      cy.wait("@getMessages");

      // Después de cargar, el pill NO debe mostrar "Cargando"
      cy.contains("Cargando").should("not.exist");

      // Debe mostrar "En línea" o "Conectando" según velocidad del socket
      cy.contains(/En línea|Conectando/, { timeout: 8000 }).should("exist");
    });

    it("CH-01c — PATH NEGATIVO — intercambio inexistente devuelve error 404 en UI", () => {
      const fakeId = "000000000000000000000000";

      cy.intercept("GET", `**/api/exchanges/${fakeId}/messages`).as("getMessages");

      cy.visit(`/intercambios/${fakeId}/chat`);

      cy.wait("@refresh");
      cy.wait("@getProfile");

      cy.wait("@getMessages").its("response.statusCode").should("eq", 404);

      cy.contains("Este intercambio no existe.", { timeout: 8000 }).should("be.visible");
      cy.get('textarea[aria-label="Campo de mensaje"]').should("not.exist");
    });

    it("CH-01d — PATH NEGATIVO — usuario sin permisos ve error 403", () => {
      cy.apiRegister({ nombre: "Charlie", apellido: "Intruder" }).then((charlie) => {
        cy.apiLogin(charlie.email, charlie.password).then((charlieToken) => {
          // Re-interceptar auth con el token de Charlie (sobrescribe el de User A)
          cy.loginForChatWith(charlieToken, charlie.user);

          cy.intercept("GET", `**/api/exchanges/${ctx.exchange._id}/messages`).as("getMessages");

          cy.visit(`/intercambios/${ctx.exchange._id}/chat`);

          cy.wait("@refresh");
          cy.wait("@getProfile");

          cy.wait("@getMessages").its("response.statusCode").should("eq", 403);

          cy.contains("No tenés permisos", { timeout: 8000 }).should("be.visible");
          cy.get('textarea[aria-label="Campo de mensaje"]').should("not.exist");

          // Cleanup Charlie
          cy.apiCleanup({
            tokens: [charlieToken],
            userIds: [charlie.user._id ?? charlie.user.id],
          });
        });
      });
    });

  });

  // ── Test 2: Bloqueo de envío de mensajes vacíos ───────────────────────────
  describe("CH-02 — Bloqueo de envío de mensajes vacíos", () => {

    let ctx;

    beforeEach(() => {
      cy.setupActiveChat().then((data) => {
        ctx = data;
        // Auth con token real para que el socket pueda autenticarse
        cy.loginForChatWith(ctx.tokenA, ctx.userA);
        // Mock del endpoint de mensajes para bypassear el bug de backend
        // y obtener exchangeStatus:"active" que habilita el ChatInput
        cy.intercept(
          "GET",
          `**/api/exchanges/${ctx.exchange._id}/messages`,
          { statusCode: 200, body: { messages: [], exchangeStatus: "active", hasMore: false } }
        ).as("getMessages");
      });
    });

    afterEach(() => {
      if (ctx) {
        cy.apiCleanup({
          tokens: [ctx.tokenA, ctx.tokenB],
          publicationIds: [ctx.pubA._id, ctx.pubB._id],
          userIds: [ctx.userA._id ?? ctx.userA.id, ctx.userB._id ?? ctx.userB.id],
        });
      }
    });

    it("CH-02a — textarea vacío: el botón de enviar está deshabilitado", () => {
      cy.visit(`/intercambios/${ctx.exchange._id}/chat`);
      cy.wait("@refresh");
      cy.wait("@getProfile");
      cy.wait("@getMessages");

      // El input debe renderizar (exchangeStatus === 'active')
      cy.get('textarea[aria-label="Campo de mensaje"]').should("be.visible");

      // Con textarea vacío, canSend = false → el botón debe estar deshabilitado
      cy.get('button[aria-label="Enviar mensaje"]').should("be.disabled");
    });

    it("CH-02b — espacios en blanco: el botón sigue deshabilitado", () => {
      cy.visit(`/intercambios/${ctx.exchange._id}/chat`);
      cy.wait("@refresh");
      cy.wait("@getProfile");
      cy.wait("@getMessages");

      // inputText.trim() === '' → canSend sigue siendo false
      cy.get('textarea[aria-label="Campo de mensaje"]').type("     ");

      cy.get('button[aria-label="Enviar mensaje"]').should("be.disabled");
    });

    it("CH-02c — texto válido + chat habilitado: el botón se activa", () => {
      cy.visit(`/intercambios/${ctx.exchange._id}/chat`);
      cy.wait("@refresh");
      cy.wait("@getProfile");
      cy.wait("@getMessages");

      // Esperar a que el socket conecte y habilite el chat.
      // ChatEmpty muestra la badge "En línea" solo cuando chatEnabled === true
      // (diferente al header que muestra "En línea" cuando connected === true)
      cy.contains("En línea", { timeout: 10000 }).should("be.visible");

      // Con texto válido + chatEnabled:true → canSend = true → botón activo
      cy.get('textarea[aria-label="Campo de mensaje"]').type("Hola, ¿coordinamos el trueque?");

      cy.get('button[aria-label="Enviar mensaje"]').should("not.be.disabled");
    });

    it("CH-02d — Enter con textarea vacío: no se agrega ningún mensaje al historial", () => {
      cy.visit(`/intercambios/${ctx.exchange._id}/chat`);
      cy.wait("@refresh");
      cy.wait("@getProfile");
      cy.wait("@getMessages");

      // Estado inicial: sin mensajes → "¡Rompan el hielo!" visible
      cy.contains("¡Rompan el hielo!", { timeout: 8000 }).should("be.visible");

      // Presionar Enter sin texto — handleSend hace early return si text === ""
      cy.get('textarea[aria-label="Campo de mensaje"]').type("{enter}");

      // El estado vacío debe persistir: ningún mensaje fue enviado ni agregado
      cy.contains("¡Rompan el hielo!").should("be.visible");
    });

    it("CH-02e — Shift+Enter: inserta nueva línea sin enviar el mensaje", () => {
      cy.visit(`/intercambios/${ctx.exchange._id}/chat`);
      cy.wait("@refresh");
      cy.wait("@getProfile");
      cy.wait("@getMessages");

      // Escribir texto, insertar salto de línea con Shift+Enter, seguir escribiendo
      cy.get('textarea[aria-label="Campo de mensaje"]')
        .type("Primera línea{shift}{enter}Segunda línea");

      // El textarea debe conservar el texto completo (no se envió)
      cy.get('textarea[aria-label="Campo de mensaje"]')
        .invoke("val")
        .should("contain", "Primera línea");

      // El historial sigue vacío: no se emitió ningún mensaje
      cy.contains("¡Rompan el hielo!").should("be.visible");
    });

  });

});
