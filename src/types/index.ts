
export interface User {
  id: number;
  nome: string;
  tipo: 'tecnico' | 'admin';
  senha?: string;
}

export interface OrdemServico {
  id: number;
  cliente: string;
  equipo: string;
  defeito: string;
  marca: string;
  modelo: string;
  configuracao: string;
  check_list: string;
  solucao: string;
  orcamento: number;
  custo_final: number;
  situacao: string;
  telefone: string;
  status: 'EM ABERTO' | 'PRONTO PARA RETIRAR' | 'ENCERRADO';
  data_entrada: string;
  data_saida: string;
  suporte_m2: string;
  volume_dados: string;
  tecnico: string;
  // Adding missing fields that are used in ordem-modal.tsx
  email?: string;
  ns?: string;
  observacao?: string;
  valor?: number;
  servicos_produtos?: string;
}

export interface Log {
  id: number;
  usuario: string;
  acao: string;
  data: string;
  ordem_id?: number;
}

export interface DatabaseConfig {
  path: string | null;
  configured: boolean;
}

export interface ServiceProduct {
  id: number;
  nome: string;
  tipo: 'servico' | 'produto';
  valor: number;
  descricao?: string;
}
