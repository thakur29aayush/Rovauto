const admin = require("firebase-admin");
const ApiError = require("../utils/apiError");

const getPrivateKey = () => {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  return key ? key.replace(/\\n/g, "\n") : "";
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

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
};

const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken) {
    throw new ApiError(400, "Firebase ID token is required");
  }

  return getFirebaseApp().auth().verifyIdToken(idToken);
};

module.exports = {
  verifyFirebaseIdToken,
};
