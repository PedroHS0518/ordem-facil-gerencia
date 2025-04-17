
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  SortAsc,
  SortDesc,
  X 
} from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | 'actions';
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Filtragem por termo de pesquisa
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    return Object.keys(item).some(key => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  });

  // Ordenação
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const toggleRowExpansion = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="w-10"></TableCell>
              {columns.map((column) => (
                <TableCell 
                  key={column.key.toString()}
                  className={column.sortable ? "cursor-pointer" : ""}
                  onClick={column.sortable ? () => handleSort(column.key as keyof T) : undefined}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      <span className="ml-2">
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <>
                  <TableRow 
                    key={index}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRowExpansion(index);
                        }}
                      >
                        {expandedRow === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.key.toString()}>
                        {column.render
                          ? column.render(item)
                          : column.key !== 'actions'
                          ? String(item[column.key as keyof T] || '')
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRow === index && (
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell colSpan={columns.length} className="bg-muted/50 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(item)
                            .filter(([key]) => !['id'].includes(key))
                            .map(([key, value]) => (
                              <div key={key} className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground capitalize">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-sm">{String(value)}</p>
                              </div>
                            ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground mt-2">
        Mostrando {sortedData.length} de {data.length} registros
      </div>
    </div>
  );
}
