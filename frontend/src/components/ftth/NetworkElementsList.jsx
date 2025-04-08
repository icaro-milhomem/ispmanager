import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Box,
  Link,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit2,
  Eye,
  ArrowUpDown,
  Trash2
} from "lucide-react";

export default function NetworkElementsList({
  networkElements,
  cables,
  networkElementTypes,
  cableTypes,
  onSelectElement,
  onSelectCable,
  onUpdateElement,
  onUpdateCable,
  onRemoveElement,
  onRemoveCable
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortElements = (elements) => {
    return [...elements].sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === "type") {
        aValue = a.type;
        bValue = b.type;
      } else if (sortField === "status") {
        aValue = a.status;
        bValue = b.status;
      } else if (sortField === "capacity") {
        aValue = a.properties.capacity;
        bValue = b.properties.capacity;
      } else if (sortField === "utilization") {
        aValue = a.properties.utilization;
        bValue = b.properties.utilization;
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortCables = (cablesArray) => {
    return [...cablesArray].sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === "type") {
        aValue = a.type;
        bValue = b.type;
      } else if (sortField === "status") {
        aValue = a.status;
        bValue = b.status;
      } else if (sortField === "length") {
        aValue = parseFloat(a.properties.length);
        bValue = parseFloat(b.properties.length);
      } else if (sortField === "fibers") {
        aValue = a.properties.fibers;
        bValue = b.properties.fibers;
      } else if (sortField === "utilization") {
        aValue = a.properties.utilization;
        bValue = b.properties.utilization;
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredElements = networkElements.filter(element => {
    return (
      element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      element.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      element.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (element.properties.address && element.properties.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const filteredCables = cables.filter(cable => {
    const startElement = networkElements.find(e => e.id === cable.start);
    const endElement = networkElements.find(e => e.id === cable.end);
    
    return (
      cable.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cable.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (startElement && startElement.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (endElement && endElement.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sortedElements = sortElements(filteredElements);
  const sortedCables = sortCables(filteredCables);

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Ativo
        </Badge>
      );
    } else if (status === "inactive") {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Inativo
        </Badge>
      );
    } else if (status === "planned") {
      return (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Planejado
        </Badge>
      );
    } else if (status === "maintenance") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Em Manutenção
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar elementos ou cabos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Tabs defaultValue="elements">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="elements" className="flex-1">
            <Box className="h-4 w-4 mr-2" />
            Elementos ({networkElements.length})
          </TabsTrigger>
          <TabsTrigger value="cables" className="flex-1">
            <Link className="h-4 w-4 mr-2" />
            Cabos ({cables.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="elements">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">
                      Nome
                      {sortField === "name" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                    <div className="flex items-center">
                      Tipo
                      {sortField === "type" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    <div className="flex items-center">
                      Status
                      {sortField === "status" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("capacity")}>
                    <div className="flex items-center">
                      Capacidade
                      {sortField === "capacity" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("utilization")}>
                    <div className="flex items-center">
                      Utilização
                      {sortField === "utilization" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedElements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Nenhum elemento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedElements.map((element) => (
                    <TableRow key={element.id}>
                      <TableCell className="font-medium">{element.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: networkElementTypes[element.type].color }}
                          ></span>
                          {networkElementTypes[element.type].name}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(element.status)}</TableCell>
                      <TableCell>{element.properties.capacity}</TableCell>
                      <TableCell>{element.properties.utilization} / {element.properties.capacity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSelectElement(element)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveElement(element.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="cables">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                    <div className="flex items-center">
                      Tipo
                      {sortField === "type" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    <div className="flex items-center">
                      Status
                      {sortField === "status" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("length")}>
                    <div className="flex items-center">
                      Comprimento
                      {sortField === "length" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("fibers")}>
                    <div className="flex items-center">
                      Fibras
                      {sortField === "fibers" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                      Nenhum cabo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCables.map((cable) => {
                    const startElement = networkElements.find(e => e.id === cable.start);
                    const endElement = networkElements.find(e => e.id === cable.end);
                    
                    return (
                      <TableRow key={cable.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: cableTypes[cable.type].color }}
                            ></span>
                            {cableTypes[cable.type].name}
                          </div>
                        </TableCell>
                        <TableCell>{startElement ? startElement.name : "Não encontrado"}</TableCell>
                        <TableCell>{endElement ? endElement.name : "Não encontrado"}</TableCell>
                        <TableCell>{getStatusBadge(cable.status)}</TableCell>
                        <TableCell>{cable.properties.length} km</TableCell>
                        <TableCell>{cable.properties.utilization} / {cable.properties.fibers}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onSelectCable(cable)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveCable(cable.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}