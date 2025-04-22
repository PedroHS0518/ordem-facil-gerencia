
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { ServiceProduct } from "@/types";
import { useServiceProduct } from "@/contexts/ServiceProductContext";
import { useToast } from "@/hooks/use-toast";

const ServicesProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, addItem, removeItem, updateItem } = useServiceProduct();
  const [searchTerm, setSearchTerm] = useState("");
  const isAdmin = user?.nome.toLowerCase() === 'admin';

  const filteredItems = items.filter(item => 
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    // Implementation will be added in the modal component
  };

  const handleRemoveItem = (id: number) => {
    if (!isAdmin) return;
    removeItem(id);
    toast({
      title: "Item removido",
      description: "O item foi removido com sucesso.",
    });
  };

  const handleEditItem = (id: number) => {
    // Implementation will be added in the modal component
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Serviços e Produtos</h1>
          {isAdmin && (
            <Button onClick={handleAddItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Item
            </Button>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar serviços e produtos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="todos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>

          {["todos", "servicos", "produtos"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems
                  .filter(item => 
                    tab === "todos" ? true : 
                    tab === "servicos" ? item.tipo === "servico" : 
                    item.tipo === "produto"
                  )
                  .map(item => (
                    <Card key={item.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-bold">
                          {item.nome}
                        </CardTitle>
                        <div className="text-lg font-bold text-primary">
                          R$ {item.valor.toFixed(2)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {item.descricao && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {item.descricao}
                          </p>
                        )}
                        {isAdmin && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default ServicesProducts;
