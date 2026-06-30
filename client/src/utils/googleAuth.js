import { signInWithPopup } from "firebase/auth";
import api from "@/api/axios";
import { auth, googleProvider } from "@/config/firebase";

const completeGoogleAuth = async (role = "CUSTOMER") => {
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken = await credential.user.getIdToken();

  const res = await api.post("/auth/google", {
    idToken,
    role,
  });

  const data = res.data?.data;

  if (!data?.user) {
    throw new Error("Invalid Google authentication response");
  }

  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

export default completeGoogleAuth;
