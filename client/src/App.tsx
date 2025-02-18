import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CommunityPage from "@/pages/community-page";
import Navbar from "@/components/navbar";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/c/:id" component={CommunityPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
