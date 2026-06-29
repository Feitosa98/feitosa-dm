import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Users } from "./pages/Users";
import { Groups } from "./pages/Groups";
import { OUs } from "./pages/OUs";
import { Computers } from "./pages/Computers";
import { DNS } from "./pages/DNS";
import { Audit } from "./pages/Audit";
import { Backup } from "./pages/Backup";
import { Shares } from "./pages/Shares";
import { SettingsPage } from "./pages/Settings";
import { Login } from "./pages/Login";
import { SetupWizard } from "./pages/SetupWizard";
import { useAuthStore } from "./stores/authStore";
import { ThemeProvider } from "./components/ThemeProvider";
import { getSetupStatus } from "./api/axios";
import { Loader2 } from "lucide-react";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const SetupGuard = ({ children }: { children: React.ReactNode }) => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    getSetupStatus()
      .then(res => setIsConfigured(res.is_configured))
      .catch(() => setIsConfigured(false));
  }, []);

  if (isConfigured === null) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!isConfigured) {
    return <SetupWizard />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="feitosa-ad-theme">
      <SetupGuard>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="groups" element={<Groups />} />
              <Route path="computers" element={<Computers />} />
              <Route path="ous" element={<OUs />} />
              <Route path="dns" element={<DNS />} />
              <Route path="shares" element={<Shares />} />
              <Route path="backup" element={<Backup />} />
              <Route path="audit" element={<Audit />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SetupGuard>
    </ThemeProvider>
  );
}

export default App;
