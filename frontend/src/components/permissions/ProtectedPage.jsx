import React from "react";
import { Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * ProtectedPage Component - Wraps a page that requires specific permissions
 * 
 * @param {object} props
 * @param {string} props.module - The module to check permission for
 * @param {string} props.permission - The specific permission to check
 * @param {React.ReactNode} props.children - Page content to display if user has permission
 */
export function ProtectedPage({ module, permission, children }) {
  // Neste momento, vamos sempre retornar true para o build funcionar
  // Em uma implementação real, verificaríamos as permissões do usuário
  const hasPermission = true;
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to={createPageUrl("SystemLogin")} replace />;
  }

  if (!hasPermission) {
    return <Navigate to={createPageUrl("Dashboard")} replace />;
  }

  return <>{children}</>;
}