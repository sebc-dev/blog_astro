import { initToolbar } from "@stagewise/toolbar";

// Configuration de base pour stagewise
const stagewiseConfig = {
  plugins: [],
};

// Initialiser la toolbar uniquement en mode développement
if (import.meta.env.DEV) {
  initToolbar(stagewiseConfig);
}
