import { OpenAPI } from "./generated/core/OpenAPI";

export const setAuthToken = (token: string | null) => {
  if (!token) {
    console.log("🔑 Clearing auth token");
    sessionStorage.removeItem("authToken");
    OpenAPI.TOKEN = undefined;
    return;
  }

  // Always strip any accidental "Bearer " prefix
  const rawToken = token.replace(/^Bearer\s+/i, "");

  console.log("🔑 Setting auth token:", rawToken);

  // Save to sessionStorage
  sessionStorage.setItem("authToken", rawToken);

  // Always read latest token from sessionStorage
  OpenAPI.TOKEN = async () => {
    const storedToken = sessionStorage.getItem("authToken");
    const headerValue = storedToken ? `Bearer ${storedToken}` : "";
    console.log("📤 Authorization header will be:", headerValue);
    return headerValue;
  };
};
