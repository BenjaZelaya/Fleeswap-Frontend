import api from '../../../services/api'

// 🔹 REGISTER (opcional: lo podés simular también si querés)
export async function register(email, password) {
  await new Promise((res) => setTimeout(res, 500))

  return {
    user: {
      id: "1",
      email,
    },
    token: "fake-token",
  }
}

// 🔹 LOGIN (simulación REALISTA)
export async function login(email, password) {
  await new Promise((res) => setTimeout(res, 500))

  // 🔥 usuarios simulados (como si vinieran del backend)
  const users = [
    {
      id: "1",
      email: "test@test.com",
      password: "1234",
      nombre: "Santino",
    },
    {
      id: "2",
      email: "user@demo.com",
      password: "5678",
      nombre: "Juan",
    },
  ]

  // buscar usuario
  const user = users.find((u) => u.email === email)

  // validar credenciales
  if (!user || user.password !== password) {
    throw new Error("EMAIL_NOT_FOUND")
  }

  // devolver como API real
  return {
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
    },
    token: "fake-token",
  }
}

// 🔹 UPDATE PROFILE (lo dejás para cuando haya backend)
export async function updateProfile(data) {
  await new Promise((res) => setTimeout(res, 500))

  return data
}