describe("Registro", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("contraseña menor a 8 caracteres → error en UI sin llamar a la API", () => {
    cy.intercept("POST", "**/api/auth/register").as("register");

    cy.get('input[name="email"]').type("juan@test.com");
    cy.get('input[name="password"]').type("123");
    cy.get('input[name="confirm"]').type("123");
    cy.get('button[type="submit"]').click();

    cy.contains("Mínimo 8 caracteres").should("be.visible");
    cy.get("@register").should("not.exist");
  });

  it("email duplicado → mensaje de error en UI", () => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 409,
      body: { message: "El email ya está registrado" },
    }).as("register");

    cy.get('input[name="email"]').type("duplicado@test.com");
    cy.get('input[name="password"]').type("Password123!");
    cy.get('input[name="confirm"]').type("Password123!");
    cy.get('button[type="submit"]').click();

    cy.wait("@register");
    cy.contains("El email ya está en uso").should("be.visible");
  });

  it("registro exitoso → redirige a /complete-profile", () => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 201,
      body: {
        token: "fake-token-123",
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

    cy.get('input[name="email"]').type("juan@test.com");
    cy.get('input[name="password"]').type("Password123!");
    cy.get('input[name="confirm"]').type("Password123!");
    cy.get('button[type="submit"]').click();

    cy.wait("@register");
    cy.url().should("include", "/complete-profile");
  });

  it("token almacenado en localStorage tras registro exitoso", () => {
    cy.intercept("POST", "**/api/auth/register", {
      statusCode: 201,
      body: {
        token: "fake-token-123",
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

    cy.get('input[name="email"]').type("juan@test.com");
    cy.get('input[name="password"]').type("Password123!");
    cy.get('input[name="confirm"]').type("Password123!");
    cy.get('button[type="submit"]').click();

    cy.wait("@register");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.equal("fake-token-123");
    });
  });
});