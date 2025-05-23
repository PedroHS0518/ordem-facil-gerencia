import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Edit, Trash2, ArrowDownAZ, ArrowUpZA, CalendarArrowUp, CalendarArrowDown } from "lucide-react";
import { ServiceProduct } from "@/types";
import { useServiceProduct } from "@/contexts/ServiceProductContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ServiceProductModal from "@/components/service-product-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ServicesProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, addItem, removeItem, updateItem } = useServiceProduct();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceProduct | undefined>();
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc" | "dateAsc" | "dateDesc">("none");
  const isAdmin = user?.nome.toLowerCase() === "admin";

  const filteredItems = items
    .filter(item => 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case "asc":
          return a.nome.localeCompare(b.nome);
        case "desc":
          return b.nome.localeCompare(a.nome);
        default:
          return 0;
      }
    });

  const handleAddItem = (data: Omit<ServiceProduct, "id">) => {
    addItem(data);
  };

  const handleEditItem = (id: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setEditingItem(item);
      setIsModalOpen(true);
    }
  };

  const handleUpdateItem = (data: Omit<ServiceProduct, "id">) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
      setEditingItem(undefined);
    }
  };

  const handleRemoveItem = (id: number) => {
    if (!isAdmin) return;
    if (window.confirm("Tem certeza que deseja remover este item?")) {
      removeItem(id);
      toast({
        title: "Item removido",
        description: "O item foi removido com sucesso.",
      });
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Serviços e Produtos</h1>
          {isAdmin && (
            <Button 
              onClick={() => {
                setEditingItem(undefined);
                setIsModalOpen(true);
              }} 
              className="ml-auto flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Item
            </Button>
          )}
        </div>

        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Pesquisar serviços e produtos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {sortOrder === "asc" ? <ArrowDownAZ className="h-4 w-4" /> :
                 sortOrder === "desc" ? <ArrowUpZA className="h-4 w-4" /> :
                 <ArrowDownAZ className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                Nome (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                <ArrowUpZA className="mr-2 h-4 w-4" />
                Nome (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

        <ServiceProductModal
          mode={editingItem ? "edit" : "add"}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={editingItem ? handleUpdateItem : handleAddItem}
          initialData={editingItem}
        />
      </main>
    </div>
  );
};

export default ServicesProducts;
