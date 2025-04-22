import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { OrdemServico, Log, DatabaseConfig } from '../types';
import { useAuth } from './AuthContext';

interface OrdemServicoContextType {
  ordens: OrdemServico[];
  logs: Log[];
  carregando: boolean;
  erro: string | null;
  filtroStatus: string | null;
  filtroTexto: string;
  dbPath: string | null;
  setDbPath: (path: string) => void;
  adicionarOrdem: (ordem: Omit<OrdemServico, 'id'>) => void;
  atualizarOrdem: (id: number, ordem: Partial<OrdemServico>) => void;
  excluirOrdem: (id: number) => void;
  setFiltroStatus: (status: string | null) => void;
  setFiltroTexto: (texto: string) => void;
  importarDados: (dados: Omit<OrdemServico, 'id'>[]) => void;
  getOrdensFiltradas: () => OrdemServico[];
  getOrdem: (id: number) => OrdemServico | undefined;
  arquivoImportado: string | null;
  setArquivoImportado: (arquivo: string | null) => void;
  exportarDados: () => string;
  baixarDadosJSON: () => void;
  carregarDadosJSON: (jsonString: string) => boolean;
}

const OrdemServicoContext = createContext<OrdemServicoContextType | undefined>(undefined);

// Dados iniciais para demonstração
const dadosIniciais: OrdemServico[] = [];

export const OrdemServicoProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [ordens, setOrdens] = useState<OrdemServico[]>(dadosIniciais);
  const [logs, setLogs] = useState<Log[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [arquivoImportado, setArquivoImportado] = useState<string | null>(null);
  const [dbPath, setDbPath] = useState<string | null>(null);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    try {
      const dadosArmazenados = localStorage.getItem('ordemFacilDados');
      const logsArmazenados = localStorage.getItem('ordemFacilLogs');
      const nomeArquivo = localStorage.getItem('ordemFacilArquivo');
      const dbPathArmazenado = localStorage.getItem('ordemFacilDbPath');
      
      if (dadosArmazenados) {
        setOrdens(JSON.parse(dadosArmazenados));
      }
      
      if (logsArmazenados) {
        setLogs(JSON.parse(logsArmazenados));
      }
      
      if (nomeArquivo) {
        setArquivoImportado(nomeArquivo);
      }
      
      if (dbPathArmazenado) {
        setDbPath(dbPathArmazenado);
      }
      
      setCarregando(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados. Por favor, tente novamente.');
      setCarregando(false);
    }
  }, []);

  // Salvar dados no localStorage quando mudam
  useEffect(() => {
    if (!carregando) {
      localStorage.setItem('ordemFacilDados', JSON.stringify(ordens));
    }
  }, [ordens, carregando]);

  useEffect(() => {
    if (!carregando) {
      localStorage.setItem('ordemFacilLogs', JSON.stringify(logs));
    }
  }, [logs, carregando]);

  useEffect(() => {
    if (arquivoImportado) {
      localStorage.setItem('ordemFacilArquivo', arquivoImportado);
    } else {
      localStorage.removeItem('ordemFacilArquivo');
    }
  }, [arquivoImportado]);

  useEffect(() => {
    if (dbPath) {
      localStorage.setItem('ordemFacilDbPath', dbPath);
      // Em um ambiente real, aqui poderia haver código para inicializar o banco de dados
      console.log(`Caminho do banco de dados configurado: ${dbPath}`);
      registrarLog(`Configurou o caminho do banco de dados para: ${dbPath}`);
    } else {
      localStorage.removeItem('ordemFacilDbPath');
    }
  }, [dbPath]);

  // Registrar log de atividade
  const registrarLog = (acao: string, ordemId?: number) => {
    if (!user) return;
    
    const novoLog: Log = {
      id: logs.length ? Math.max(...logs.map(log => log.id)) + 1 : 1,
      usuario: user.nome,
      acao,
      data: new Date().toISOString(),
      ordem_id: ordemId
    };
    
    setLogs(prevLogs => [...prevLogs, novoLog]);
  };

  // Adicionar nova ordem
  const adicionarOrdem = (ordem: Omit<OrdemServico, 'id'>) => {
    const novaOrdem: OrdemServico = {
      ...ordem,
      id: ordens.length ? Math.max(...ordens.map(o => o.id)) + 1 : 1
    };
    
    setOrdens(prevOrdens => [...prevOrdens, novaOrdem]);
    registrarLog(`Adicionou nova ordem para cliente: ${ordem.cliente}`, novaOrdem.id);
  };

  // Atualizar ordem existente
  const atualizarOrdem = (id: number, ordemAtualizada: Partial<OrdemServico>) => {
    const ordemIndex = ordens.findIndex(o => o.id === id);
    
    if (ordemIndex === -1) {
      setErro('Ordem não encontrada.');
      return;
    }
    
    const ordensAtualizadas = [...ordens];
    const antigaOrdem = ordensAtualizadas[ordemIndex];
    
    // Identificar quais campos foram alterados
    const camposAlterados = Object.entries(ordemAtualizada)
      .filter(([chave, valor]) => {
        // @ts-ignore
        return antigaOrdem[chave] !== valor;
      })
      .map(([chave, valor]) => {
        // @ts-ignore
        return `${chave}: ${antigaOrdem[chave]} -> ${valor}`;
      });
    
    if (camposAlterados.length > 0) {
      // Atualizar a ordem
      ordensAtualizadas[ordemIndex] = { ...antigaOrdem, ...ordemAtualizada };
      setOrdens(ordensAtualizadas);
      
      // Registrar log com os campos alterados
      registrarLog(
        `Atualizou ordem #${id} (${antigaOrdem.cliente}): ${camposAlterados.join(', ')}`,
        id
      );
    }
  };

  // Excluir ordem
  const excluirOrdem = (id: number) => {
    const ordem = ordens.find(o => o.id === id);
    if (!ordem) {
      setErro('Ordem não encontrada.');
      return;
    }
    
    setOrdens(prevOrdens => prevOrdens.filter(o => o.id !== id));
    registrarLog(`Excluiu ordem #${id} (${ordem.cliente})`, id);
  };

  // Importar dados (usado pelo admin)
  const importarDados = (novosDados: Omit<OrdemServico, 'id'>[]) => {
    // Criar novos IDs para os dados importados
    const dadosComIds = novosDados.map((dado, index) => ({
      ...dado,
      id: index + 1
    }));
    
    setOrdens(dadosComIds);
    registrarLog(`Importou ${novosDados.length} ordens de serviço`);
  };

  // Obter ordens filtradas pelo status e texto
  const getOrdensFiltradas = () => {
    return ordens.filter(ordem => {
      const matchTexto = !filtroTexto || 
        ordem.cliente.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        ordem.equipo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        ordem.defeito.toLowerCase().includes(filtroTexto.toLowerCase());
      
      // Only apply status filter if there's no search text
      const matchStatus = !filtroStatus || filtroTexto ? true : ordem.status === filtroStatus;
      
      return matchStatus && matchTexto;
    });
  };

  // Obter uma ordem específica pelo ID
  const getOrdem = (id: number) => {
    return ordens.find(ordem => ordem.id === id);
  };

  // Exportar todos os dados em formato JSON
  const exportarDados = () => {
    const dadosExportar = {
      ordens: ordens,
      logs: logs,
      dbConfig: {
        path: dbPath
      }
    };
    
    return JSON.stringify(dadosExportar, null, 2);
  };

  // Baixar dados em formato JSON
  const baixarDadosJSON = () => {
    const dadosJSON = exportarDados();
    const blob = new Blob([dadosJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ordem_facil_dados.json';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    if (user) {
      registrarLog(`Exportou dados do sistema para arquivo JSON`);
    }
  };

  // Carregar dados de um arquivo JSON
  const carregarDadosJSON = (jsonString: string): boolean => {
    try {
      const dados = JSON.parse(jsonString);
      
      if (dados && dados.ordens && Array.isArray(dados.ordens)) {
        setOrdens(dados.ordens);
        
        if (dados.logs && Array.isArray(dados.logs)) {
          setLogs(dados.logs);
        }
        
        if (dados.dbConfig && dados.dbConfig.path) {
          setDbPath(dados.dbConfig.path);
        }
        
        if (user) {
          registrarLog(`Importou dados para o sistema a partir de um arquivo JSON`);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao carregar dados JSON:', error);
      return false;
    }
  };

  return (
    <OrdemServicoContext.Provider value={{
      ordens,
      logs,
      carregando,
      erro,
      filtroStatus,
      filtroTexto,
      dbPath,
      setDbPath,
      adicionarOrdem,
      atualizarOrdem,
      excluirOrdem,
      setFiltroStatus,
      setFiltroTexto,
      importarDados,
      getOrdensFiltradas,
      getOrdem,
      arquivoImportado,
      setArquivoImportado,
      exportarDados,
      baixarDadosJSON,
      carregarDadosJSON
    }}>
      {children}
    </OrdemServicoContext.Provider>
  );
};

export const useOrdemServico = () => {
  const context = useContext(OrdemServicoContext);
  if (context === undefined) {
    throw new Error('useOrdemServico deve ser usado dentro de um OrdemServicoProvider');
  }
  return context;
};
