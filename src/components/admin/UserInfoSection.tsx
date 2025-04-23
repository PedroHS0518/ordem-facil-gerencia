
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";

interface UserInfoSectionProps {
  user: User | null;
  onLogout: () => void;
}

export function UserInfoSection({ user, onLogout }: UserInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Usuário:</strong> {user?.nome}</p>
        <div className="mt-4">
          <Button onClick={onLogout} variant="destructive">
            Sair
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
