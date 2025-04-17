
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { read, utils } from "xlsx";
import { OrdemServico } from "@/types";

interface FileImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: Partial<OrdemServico>[], filePath: string) => void;
}

export function FileImport({ open, onOpenChange, onImport }: FileImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [headerRow, setHeaderRow] = useState("1");
  const [dataStartRow, setDataStartRow] = useState("2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setFileName("");
    setPreviewData([]);
    setHeaders([]);
    setHeaderRow("1");
    setDataStartRow("2");
    setLoading(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        if (jsonData.length > 0) {
          // Exibir as primeiras 10 linhas como preview
          setPreviewData(jsonData.slice(0, 10) as any[]);
          // Set default header row
          const firstRowWithData = jsonData.findIndex((row: any) => row.length > 0);
          if (firstRowWithData >= 0) {
            setHeaderRow((firstRowWithData + 1).toString());
            setDataStartRow((firstRowWithData + 2).toString());
            setHeaders(jsonData[firstRowWithData] as string[]);
          }
        } else {
          setError("O arquivo não contém dados.");
        }
      } catch (err) {
        console.error("Erro ao processar arquivo:", err);
        setError("Não foi possível processar o arquivo. Certifique-se de que é um arquivo XLSX válido.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = () => {
    if (!file) {
      setError("Nenhum arquivo selecionado.");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = utils.sheet_to_json(worksheet, { header: 1, defval: "" });

          // A linha de cabeçalho é a linha selecionada pelo usuário
          const headerRowIndex = parseInt(headerRow) - 1;
          const dataStartRowIndex = parseInt(dataStartRow) - 1;

          if (headerRowIndex < 0 || headerRowIndex >= jsonData.length) {
            throw new Error("A linha de cabeçalho selecionada não existe no arquivo.");
          }

          if (dataStartRowIndex < 0 || dataStartRowIndex >= jsonData.length) {
            throw new Error("A linha de início dos dados não existe no arquivo.");
          }

          // Pegue os cabeçalhos da linha especificada
          const headers = jsonData[headerRowIndex] as string[];
          // Extraia os dados a partir da linha especificada
          const dataRows = jsonData.slice(dataStartRowIndex);

          // Converta os dados para objetos com os cabeçalhos corretos
          const dados = dataRows.map((row: any) => {
            const obj: Record<string, any> = {};
            headers.forEach((header, index) => {
              if (header && header.toString().trim()) {
                obj[header.toString().trim()] = row[index] || "";
              }
            });
            return obj;
          });

          // Mapeie para o formato esperado de OrdemServico
          const ordensImportadas = dados.map((item: Record<string, any>) => {
            return {
              cliente: item.CLIENTE || "",
              equipo: item.EQUIPO || "",
              defeito: item.DEFEITO || "",
              marca: item.MARCA || "",
              modelo: item.MODELO || "",
              configuracao: item.CONFIGURAÇÃO || item.CONFIGURACAO || "",
              check_list: item.CHECK_LIST || "",
              solucao: item.SOLUÇÃO || item.SOLUCAO || "",
              orcamento: parseFloat(item.ORÇAMENTO || item.ORCAMENTO || 0),
              custo_final: parseFloat(item.CUSTO_FINAL || 0),
              situacao: item.SITUAÇÃO || item.SITUACAO || "",
              telefone: item.TELEFONE || "",
              status: item.STATUS || "EM ABERTO",
              data_entrada: item.DATA_ENTRADA || new Date().toISOString().split('T')[0],
              data_saida: item.DATA_SAIDA || "",
              suporte_m2: item.SUPORTE_M2 || "",
              volume_dados: item.VOLUME_DADOS || "",
              tecnico: item.TÉCNICO || item.TECNICO || "",
            } as Partial<OrdemServico>;
          }).filter((item: Partial<OrdemServico>) => item.cliente && item.cliente.trim() !== "");

          onImport(ordensImportadas, file.name);
          onOpenChange(false);
          resetState();
        } catch (err) {
          console.error("Erro ao importar dados:", err);
          setError(err instanceof Error ? err.message : "Erro ao importar dados");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Erro ao ler arquivo:", err);
      setError("Erro ao ler o arquivo");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetState();
    }}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Ordens de Serviço</DialogTitle>
          <DialogDescription>
            Selecione um arquivo XLSX para importar os dados das ordens de serviço.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              {file ? `Arquivo selecionado: ${fileName}` : "Nenhum arquivo selecionado"}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {previewData.length > 0 && (
            <div className="space-y-4 overflow-auto flex-1">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Linha do cabeçalho</label>
                  <Select value={headerRow} onValueChange={setHeaderRow}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione a linha" />
                    </SelectTrigger>
                    <SelectContent>
                      {previewData.map((_, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          Linha {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Início dos dados</label>
                  <Select value={dataStartRow} onValueChange={setDataStartRow}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione a linha" />
                    </SelectTrigger>
                    <SelectContent>
                      {previewData.map((_, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          Linha {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell className="font-medium">Linha</TableCell>
                      {previewData[0]?.map((_: any, index: number) => (
                        <TableCell key={index} className="font-medium">
                          {`Coluna ${index + 1}`}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row: any, rowIndex: number) => (
                      <TableRow 
                        key={rowIndex}
                        className={
                          rowIndex === parseInt(headerRow) - 1
                            ? "bg-primary/10"
                            : rowIndex >= parseInt(dataStartRow) - 1
                            ? "bg-accent/10"
                            : ""
                        }
                      >
                        <TableCell className="font-medium">
                          {rowIndex + 1}
                          {rowIndex === parseInt(headerRow) - 1 && " (Cabeçalho)"}
                          {rowIndex === parseInt(dataStartRow) - 1 && " (Início)"}
                        </TableCell>
                        {row.map((cell: any, cellIndex: number) => (
                          <TableCell key={cellIndex}>
                            {cell.toString()}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Isto irá substituir todos os dados existentes
              </p>
              <Button 
                onClick={handleImport} 
                disabled={!file || loading}
                variant="default"
              >
                {loading ? "Importando..." : "Importar Dados"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
