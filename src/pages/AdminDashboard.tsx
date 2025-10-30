import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {currentUser.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-semibold">Email:</span> {currentUser.email}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Department:</span> {currentUser.meta.department}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Employee ID:</span> {currentUser.meta.employeeId}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
