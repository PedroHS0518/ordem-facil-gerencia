import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrdemServico } from "@/contexts/OrdemServicoContext";
import { Button } from "@/components/ui/button";
import { FileImport } from "@/components/ui/file-import";
import { DatabasePathSelector } from "@/components/ui/database-path-selector";
import { JsonDataManager } from "@/components/ui/json-data-manager";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClienteModal } from "@/components/cliente-modal";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  FileSpreadsheet, 
  Database, 
  Clock, 
  ArrowLeft, 
  Settings, 
  List,
  LogOut,
  User,
  BarChart3,
  HardDrive,
  FileJson
} from "lucide-react";
import { OrdemServico } from "@/types";

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const { 
    ordens, 
    logs, 
    importarDados, 
    arquivoImportado,
    setArquivoImportado,
    dbPath,
    setDbPath,
    baixarDadosJSON,
    carregarDadosJSON
  } = useOrdemServico();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [dbPathDialogOpen, setDbPathDialogOpen] = useState(false);
  const [jsonManagerOpen, setJsonManagerOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.tipo === "admin" || user?.nome === "Admin") {
      setIsAdmin(true);
    }
  }, [user]);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleImportData = (dados: any[], filePath: string) => {
    if (dados.length > 0) {
      const ordensCompletas = dados.map(item => ({
        cliente: item.cliente || '',
        equipo: item.equipo || '',
        marca: item.marca || '',
        modelo: item.modelo || '',
        configuracao: item.configuracao || '',
        check_list: item.check_list || '',
        defeito: item.defeito || '',
        solucao: item.solucao || '',
        orcamento: Number(item.orcamento) || 0,
        custo_final: Number(item.custo_final) || 0,
        situacao: item.situacao || '',
        telefone: item.telefone || '',
        status: item.status || 'EM ABERTO',
        data_entrada: item.data_entrada || new Date().toISOString(),
        data_saida: item.data_saida || '',
        suporte_m2: item.suporte_m2 || '',
        volume_dados: item.volume_dados || '',
        tecnico: item.tecnico || ''
      }));
      
      importarDados(ordensCompletas);
      setArquivoImportado(filePath);
      toast({
        title: "Importação concluída",
        description: `${dados.length} ordens de serviço foram importadas com sucesso.`,
      });
    } else {
      toast({
        title: "Falha na importação",
        description: "Nenhum dado válido encontrado no arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleDbPathSelect = (path: string) => {
    setDbPath(path);
    toast({
      title: "Configuração salva",
      description: `Caminho do banco de dados configurado: ${path}`,
    });
  };

  const handleJsonImport = (jsonData: string): boolean => {
    const success = carregarDadosJSON(jsonData);
    if (success) {
      toast({
        title: "Importação concluída",
        description: "Dados JSON importados com sucesso.",
      });
    }
    return success;
  };

  const handleJsonExport = () => {
    baixarDadosJSON();
  };

  const ordensAbertasCount = ordens.filter(o => o.status === "EM ABERTO").length;
  const ordensProntasCount = ordens.filter(o => o.status === "PRONTO PARA RETIRAR").length;
  const ordensEncerradasCount = ordens.filter(o => o.status === "ENCERRADO").length;

  const colunas = [
    { 
      key: "cliente" as keyof OrdemServico, 
      header: "Cliente", 
      sortable: true 
    },
    { 
      key: "equipo" as keyof OrdemServico, 
      header: "Equipamento", 
      sortable: true 
    },
    { 
      key: "status" as keyof OrdemServico, 
      header: "Status", 
      sortable: true,
      render: (ordem: OrdemServico) => <StatusBadge status={ordem.status} />
    },
    { 
      key: "tecnico" as keyof OrdemServico, 
      header: "Técnico", 
      sortable: true 
    },
    { 
      key: "data_entrada" as keyof OrdemServico, 
      header: "Data Entrada", 
      sortable: true,
      render: (ordem: OrdemServico) => new Date(ordem.data_entrada).toLocaleDateString('pt-BR')
    }
  ];

  const colunasLogs = [
    { 
      key: "usuario" as keyof typeof logs[0], 
      header: "Usuário", 
      sortable: true 
    },
    { 
      key: "acao" as keyof typeof logs[0], 
      header: "Ação", 
      sortable: true 
    },
    { 
      key: "data" as keyof typeof logs[0], 
      header: "Data/Hora", 
      sortable: true,
      render: (log: any) => new Date(log.data).toLocaleString('pt-BR')
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToDashboard}
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Painel Administrativo</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.nome || "Usuário"}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        {isAdmin ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Ordens
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ordens.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ordens registradas no sistema
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Em Aberto
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ordensAbertasCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ordens em processamento
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Prontas
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ordensProntasCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aguardando retirada
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Encerradas
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ordensEncerradasCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ordens finalizadas
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <Button 
                onClick={() => setImportDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" /> 
                Importar Dados XLSX
              </Button>
              <Button
                onClick={() => setDbPathDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <HardDrive className="h-4 w-4" />
                Configurar Banco de Dados
              </Button>
              <Button
                onClick={() => setJsonManagerOpen(true)}
                className="flex items-center gap-2"
                variant="secondary"
              >
                <FileJson className="h-4 w-4" />
                Exportar/Importar JSON
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              {dbPath && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Banco de Dados
                    </CardTitle>
                    <CardDescription>
                      Caminho configurado para o banco de dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span className="text-sm break-all">{dbPath}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {arquivoImportado && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Arquivo Importado
                    </CardTitle>
                    <CardDescription>
                      Último arquivo importado para o sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="text-sm break-all">{arquivoImportado}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Tabs defaultValue="ordens" className="space-y-4">
              <TabsList>
                <TabsTrigger value="ordens" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Ordens de Serviço
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Logs do Sistema
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ordens" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Todas as Ordens de Serviço</CardTitle>
                    <CardDescription>
                      Visualize, filtre e gerencie todas as ordens do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={ordens}
                      columns={colunas}
                      onRowClick={(ordem) => setClienteSelecionado(ordem.id)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Logs do Sistema</CardTitle>
                    <CardDescription>
                      Histórico de atividades realizadas no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={logs}
                      columns={colunasLogs}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="text-2xl font-bold mb-6">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">
              Esta área é restrita para administradores. Você precisa fazer login como administrador para acessar este painel.
            </p>
            <Button 
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>
        )}
      </main>

      <footer className="border-t bg-white py-4">
        <div className="container flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ordem Fácil. Todos os direitos reservados.
          </div>
          <div className="text-sm text-muted-foreground">
            Versão 1.0.0
          </div>
        </div>
      </footer>

      <ClienteModal
        clienteId={clienteSelecionado}
        onOpenChange={(isOpen) => {
          if (!isOpen) setClienteSelecionado(null);
        }}
      />

      <FileImport 
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportData}
      />

      <DatabasePathSelector
        open={dbPathDialogOpen}
        onOpenChange={setDbPathDialogOpen}
        onPathSelect={handleDbPathSelect}
        currentPath={dbPath}
      />

      <JsonDataManager
        open={jsonManagerOpen}
        onOpenChange={setJsonManagerOpen}
        onImport={handleJsonImport}
        onExport={handleJsonExport}
        dbPath={dbPath}
      />
    </div>
  );
};

export default AdminPanel;
