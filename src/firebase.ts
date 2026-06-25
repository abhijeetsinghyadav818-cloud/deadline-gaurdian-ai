/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "../firebase-applet-config.json";

// Safe JSON module resolution helper
const rawConfig = (firebaseConfigJson as any).default || firebaseConfigJson;

function sanitize(val: any, fallback: string): string {
  if (!val) return fallback;
  const str = String(val).trim().replace(/^["']|["']$/g, ""); // Strip quotes if any
  if (
    !str ||
    str === "undefined" ||
    str === "null" ||
    str === "YOUR_FIREBASE_API_KEY" ||
    str.includes("CHANGE_ME") ||
    str === '""' ||
    str === "''"
  ) {
    return fallback;
  }
  return str;
}

const cleanConfig = {
  apiKey: sanitize(import.meta.env.VITE_FIREBASE_API_KEY, rawConfig.apiKey),
  authDomain: sanitize(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, rawConfig.authDomain),
  projectId: sanitize(import.meta.env.VITE_FIREBASE_PROJECT_ID, rawConfig.projectId),
  storageBucket: sanitize(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, rawConfig.storageBucket),
  messagingSenderId: sanitize(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, rawConfig.messagingSenderId),
  appId: sanitize(import.meta.env.VITE_FIREBASE_APP_ID, rawConfig.appId),
};

console.log("Deadline Guardian AI - Config loaded:", {
  projectId: cleanConfig.projectId,
  hasApiKey: !!cleanConfig.apiKey,
  apiKeyLength: cleanConfig.apiKey?.length || 0,
});

// Initialize Firebase
const app = initializeApp(cleanConfig);

export const analytics = null;
export const auth = getAuth(app);
const rawDbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || rawConfig.firestoreDatabaseId || "(default)";
const dbId = sanitize(rawDbId, "(default)");
export const db = getFirestore(app, dbId);

export const activeConfig = {
  projectId: cleanConfig.projectId && cleanConfig.projectId !== "single-amulet-g2gpt" ? cleanConfig.projectId : "deadline-guardian-ai",
};





