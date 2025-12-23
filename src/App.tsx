import React, { useState } from "react";
import Home from "./components/Home";
import PainelPublico from "./components/PainelPublico";
import Atendente from "./components/Atendente";
import GeradorSenhas from "./components/GeradorSenhas";
import Administrador from "./components/Administrador";
import Dashboard from "./components/Dashboard";
import { SenhasProvider } from "./context/SenhasContext";

export type Screen =
  | "home"
  | "painel-publico"
  | "atendente"
  | "gerador"
  | "admin"
  | "dashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<Screen>("home");

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home onNavigate={setCurrentScreen} />;
      case "painel-publico":
        return <PainelPublico onNavigate={setCurrentScreen} />;
      case "atendente":
        return <Atendente onNavigate={setCurrentScreen} />;
      case "gerador":
        return <GeradorSenhas onNavigate={setCurrentScreen} />;
      case "admin":
        return <Administrador onNavigate={setCurrentScreen} />;
      case "dashboard":
        return <Dashboard onNavigate={setCurrentScreen} />;
      default:
        return <Home onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <SenhasProvider>
      <div className="min-h-screen">{renderScreen()}</div>
    </SenhasProvider>
  );
}