const admin = require("firebase-admin");
const ApiError = require("../utils/apiError");

const cleanEnv = (value) => {
  return String(value || "").trim().replace(/^"|"$/g, "");
};

const getPrivateKey = () => {
  const key = cleanEnv(process.env.FIREBASE_PRIVATE_KEY);
  return key ? key.replace(/\\n/g, "\n") : "";
};

const decodeJwtPayload = (token) => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new ApiError(400, "Firebase ID token is malformed");
  }

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "="
    );

    return JSON.parse(Buffer.from(paddedPayload, "base64").toString("utf8"));
  } catch {
    throw new ApiError(400, "Firebase ID token payload is malformed");
  }
};

const getFirebaseApp = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const projectId = cleanEnv(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = cleanEnv(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new ApiError(503, "Firebase authentication is not configured");
  }

  if (
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new ApiError(
      503,
      "Firebase private key is invalid. Paste the full private_key value with \\n characters."
    );
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    throw new ApiError(
      503,
      `Firebase authentication configuration is invalid: ${error.message}`
    );
  }
};

const verifyFirebaseIdToken = async (idToken) => {
  const token = typeof idToken === "string" ? idToken.trim() : "";
  const projectId = cleanEnv(process.env.FIREBASE_PROJECT_ID);

  if (!token) {
    throw new ApiError(400, "Firebase ID token is required");
  }

  const decodedPayload = decodeJwtPayload(token);

  if (projectId && decodedPayload.aud !== projectId) {
    throw new ApiError(
      401,
      `Firebase project mismatch. Token project is "${decodedPayload.aud}", backend FIREBASE_PROJECT_ID is "${projectId}".`
    );
  }

  try {
    return await getFirebaseApp().auth().verifyIdToken(token);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Firebase ID token verification failed", {
      code: error.code,
      message: error.message,
      tokenProject: decodedPayload.aud,
      tokenIssuer: decodedPayload.iss,
      backendProject: projectId,
    });

    throw new ApiError(
      401,
      `Firebase ID token verification failed: ${error.code || error.message}`
    );
  }
};

module.exports = {
  verifyFirebaseIdToken,
};
