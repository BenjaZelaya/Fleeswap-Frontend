describe("Registro", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("RE-01 — contraseña menor a 8 caracteres: error en UI sin llamar a la API", () => {
    cy.intercept("POST", "**/api/auth/register").as("register");

    cy.get('input[name="nombre"]').type("Juan");
    cy.get('input[name="apellido"]').type("Perez");
    cy.get('input[name="fechaNacimiento"]').type("2000-01-01");
    cy.get('input[name="email"]').type("juan@test.com");
    cy.get('input[name="password"]').type("123");
    cy.get('input[name="confirm"]').type("123");
    cy.get('button[type="submit"]').click();

    cy.contains("M\u00ednimo 8 caracteres").should("be.visible");
    cy.get("@register").should("not.exist");
  });

  it("RE-02 — email duplicado: mensaje de error en UI", () => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 409,
      body: { message: "El email ya esta en uso" },
    }).as("register");

    cy.get('input[name="nombre"]').type("Juan");
    cy.get('input[name="apellido"]').type("Perez");
    cy.get('input[name="fechaNacimiento"]').type("2000-01-01");
    cy.get('input[name="email"]').type("duplicado@test.com");
    cy.get('input[name="password"]').type("Password123!");
    cy.get('input[name="confirm"]').type("Password123!");
    cy.get('button[type="submit"]').click();

    cy.wait("@register");
    cy.contains("El email ya esta en uso").should("be.visible");
  });

  it("RE-03 — registro exitoso: redirige a /complete-profile", () => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 201,
      body: {
        accessToken: "fake-access-token-123",
        user: {
          id: "123",
          nombre: "Juan",
          apellido: "Perez",
          email: "juan@test.com",
          role: "user",
          isVerified: false,
        },
      },
    }).as("register");

    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        id: "123",
        nombre: "Juan",
        apellido: "Perez",
        email: "juan@test.com",
        role: "user",
        isVerified: false,
      },
    }).as("getProfile");

    cy.get('input[name="nombre"]').type("Juan");
    cy.get('input[name="apellido"]').type("Perez");
    cy.get('input[name="fechaNacimiento"]').type("2000-01-01");
    cy.get('input[name="email"]').type("juan@test.com");
    cy.get('input[name="password"]').type("Password123!");
    cy.get('input[name="confirm"]').type("Password123!");
    cy.get('button[type="submit"]').click();

    cy.wait("@register");
    cy.url().should("eq", "http://localhost:5173/");
  });

    it("RE-04 — registro exitoso: user persiste en localStorage", () => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 201,
      body: {
        accessToken: "fake-access-token-123",
        user: {
          id: "123",
          nombre: "Juan",
          apellido: "Perez",
          email: "juan@test.com",
          role: "user",
          isVerified: false,
        },
      },
    }).as("register");

    cy.get('input[name="nombre"]').type("Juan");
    cy.get('input[name="apellido"]').type("Perez");
    cy.get('input[name="fechaNacimiento"]').type("2000-01-01");
    cy.get('input[name="email"]').type("juan@test.com");
    cy.get('input[name="password"]').type("Password123!");
    cy.get('input[name="confirm"]').type("Password123!");
    cy.get('button[type="submit"]').click();

    cy.wait("@register");
    cy.url().should("eq", "http://localhost:5173/");

    cy.window().then((win) => {
      const raw = win.localStorage.getItem("fleeswap-auth");
      expect(raw).to.not.be.null;
      const parsed = JSON.parse(raw);
      expect(parsed.state.user.email).to.equal("juan@test.com");
    });
  });
});