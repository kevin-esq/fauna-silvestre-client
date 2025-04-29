import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";

export default function App() {
  console.log("[App] render ➤ Montando App");
  return (
    // Puedes volver a envolver en GestureHandlerRootView si lo necesitas
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
