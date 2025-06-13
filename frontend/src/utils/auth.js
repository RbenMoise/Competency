// utils/auth.js
import { jwtDecode } from "jwt-decode";

export function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode(token); // uses the jwt-decode library
    // console.log("Decoded User:", decoded); // Should show name, role, id
    return decoded;
  } catch (err) {
    console.error("Token decoding failed:", err);
    return null;
  }
}
