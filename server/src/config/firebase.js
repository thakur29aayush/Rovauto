const admin = require("firebase-admin");
const ApiError = require("../utils/apiError");

const getPrivateKey = () => {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  return key ? key.replace(/^"|"$/g, "").replace(/\\n/g, "\n") : "";
};

const getFirebaseApp = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new ApiError(503, "Firebase authentication is not configured");
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
  if (!idToken) {
    throw new ApiError(400, "Firebase ID token is required");
  }

  try {
    return await getFirebaseApp().auth().verifyIdToken(idToken);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw new ApiError(
      401,
      `Firebase ID token verification failed: ${error.message}`
    );
  }
};

module.exports = {
  verifyFirebaseIdToken,
};
