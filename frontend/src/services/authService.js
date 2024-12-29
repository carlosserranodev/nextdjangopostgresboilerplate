import axios from "axios";
import { getTokens, setTokens, removeTokens } from "../utils/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${API_URL}/api/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get current user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function login(username, password) {
  try {
    console.log("Intentando login con:", { username, password });

    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    console.log("Respuesta del servidor:", response);

    if (!response.ok) {
      const error = await response.json();
      console.error("Error del servidor:", error);
      throw new Error(error.error || "Error en el inicio de sesión");
    }

    const data = await response.json();
    console.log("Datos recibidos:", data);

    if (data.tokens?.access) {
      // Guardamos el token en localStorage y cookies
      localStorage.setItem("token", data.tokens.access);
      document.cookie = `token=${data.tokens.access}; path=/`;
    }
    return data.user;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}

export async function logout() {
  localStorage.removeItem("token");
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
}

export const register = async (userData) => {
  try {
    console.log("Intentando registro con:", userData);
    console.log("URL de la API:", `${API_URL}/api/auth/register/`);

    const response = await fetch(`${API_URL}/api/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("Respuesta del servidor:", response);

    if (!response.ok) {
      const error = await response.json();
      console.error("Error del servidor:", error);
      throw new Error(error.message || "Error en el registro");
    }

    const data = await response.json();
    if (data.tokens?.access) {
      localStorage.setItem("token", data.tokens.access);
    }
    return data.user;
  } catch (error) {
    console.error("Error detallado:", error);
    throw error;
  }
};
