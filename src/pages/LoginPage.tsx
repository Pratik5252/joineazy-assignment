import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (role: "student" | "admin") => {
    setIsLoading(true);

    try {
      await login(role);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-400 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-2">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Assignment Portal
          </CardTitle>
          <CardDescription className="text-base">
            Select your role to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleLogin("student")}
            className="w-full h-14 text-lg"
            size="lg"
            variant="default"
            disabled={isLoading}
          >
            <UserCircle className="mr-2 h-5 w-5" />
            Login as Student
          </Button>
          <Button
            onClick={() => handleLogin("admin")}
            className="w-full h-14 text-lg"
            size="lg"
            variant="outline"
            disabled={isLoading}
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            Login as Admin
          </Button>
          <p className="text-center text-xs text-muted-foreground pt-4">
            Demo Mode: Direct login for demonstration purposes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
