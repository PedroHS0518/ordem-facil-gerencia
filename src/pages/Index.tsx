import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar automaticamente para a página de login
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <p className="text-xl text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;
