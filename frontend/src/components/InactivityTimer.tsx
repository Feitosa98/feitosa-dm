import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutos

export function InactivityTimer() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // So inicia o timer se o usuario estiver logado
    if (isAuthenticated) {
      timerRef.current = setTimeout(() => {
        // Tempo expirou por inatividade
        logout();
        navigate("/login", { state: { message: "Sessão expirada por inatividade (5 minutos)." } });
      }, INACTIVITY_LIMIT_MS);
    }
  };

  useEffect(() => {
    // Eventos que indicam atividade do usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetTimer();
    
    events.forEach(event => document.addEventListener(event, handleActivity));
    
    // Inicializa
    resetTimer();

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, navigate, logout]);

  return null; // Componente invisivel, atua no background
}
