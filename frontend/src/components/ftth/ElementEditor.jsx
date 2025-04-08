import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Box,
  Link,
  Trash2,
  Save,
  Info,
  MapPin,
  Edit2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cable,
  Ruler
} from "lucide-react";

export default function ElementEditor({
  selectedElement,
  selectedCable,
  onUpdateElement,
  onUpdateCable,
  onRemoveElement,
  onRemoveCable,
  networkElementTypes,
  cableTypes,
  networkElements
}) {
  const [editedElement, setEditedElement] = useState(null);
  const [editedCable, setEditedCable] = useState(null);
  const [isEditingElement, setIsEditingElement] = useState(false);
  const [isEditingCable, setIsEditingCable] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      setEditedElement(JSON.parse(JSON.stringify(selectedElement)));
      setEditedCable(null);
      setIsEditingElement(false);
    } else {
      setEditedElement(null);
    }
  }, [selectedElement]);

  useEffect(() => {
    if (selectedCable) {
      setEditedCable(JSON.parse(JSON.stringify(selectedCable)));
      setEditedElement(null);
      setIsEditingCable(false);
    } else {
      setEditedCable(null);
    }
  }, [selectedCable]);

  const handleSaveElement = () => {
    onUpdateElement(editedElement);
    setIsEditingElement(false);
  };

  const handleSaveCable = () => {
    onUpdateCable(editedCable);
    setIsEditingCable(false);
  };

  const findElementById = (id) => {
    return networkElements.find(e => e.id === id);
  };

  if (!editedElement && !editedCable) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
          <CardDescription>
            Selecione um elemento ou cabo para ver seus detalhes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full">
          <Info className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">
            Clique em um elemento ou cabo no mapa para visualizar e editar suas propriedades
          </p>
        </CardContent>
      </Card>
    );
  }

  if (editedElement) {
    return (
      <Card className="h-full overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: networkElementTypes[editedElement.type].color }}
                ></span>
                {isEditingElement ? (
                  <Input
                    value={editedElement.name}
                    onChange={(e) => setEditedElement({...editedElement, name: e.target.value})}
                    className="max-w-[200px]"
                  />
                ) : (
                  editedElement.name
                )}
              </CardTitle>
              <CardDescription>
                {networkElementTypes[editedElement.type].description}
              </CardDescription>
            </div>
            <div>
              {isEditingElement ? (
                <Button size="sm" variant="outline" onClick={() => setIsEditingElement(false)}>
                  Cancelar
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditingElement(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="properties">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="properties" className="flex-1">Propriedades</TabsTrigger>
              <TabsTrigger value="connections" className="flex-1">Conexões</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    {isEditingElement ? (
                      <Select
                        value={editedElement.type}
                        onValueChange={(value) => setEditedElement({...editedElement, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(networkElementTypes).map(type => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center">
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: networkElementTypes[type].color }}
                                ></span>
                                {networkElementTypes[type].name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: networkElementTypes[editedElement.type].color }}
                        ></span>
                        {networkElementTypes[editedElement.type].name}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    {isEditingElement ? (
                      <Select
                        value={editedElement.status}
                        onValueChange={(value) => setEditedElement({...editedElement, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="planned">Planejado</SelectItem>
                          <SelectItem value="maintenance">Em Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                        {editedElement.status === "active" && (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Ativo
                          </Badge>
                        )}
                        {editedElement.status === "inactive" && (
                          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Inativo
                          </Badge>
                        )}
                        {editedElement.status === "planned" && (
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Planejado
                          </Badge>
                        )}
                        {editedElement.status === "maintenance" && (
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Em Manutenção
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Coordenadas</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Latitude</Label>
                      {isEditingElement ? (
                        <Input
                          value={editedElement.position.lat}
                          onChange={(e) => setEditedElement({
                            ...editedElement,
                            position: {
                              ...editedElement.position,
                              lat: parseFloat(e.target.value)
                            }
                          })}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                          {editedElement.position.lat.toFixed(6)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Longitude</Label>
                      {isEditingElement ? (
                        <Input
                          value={editedElement.position.lng}
                          onChange={(e) => setEditedElement({
                            ...editedElement,
                            position: {
                              ...editedElement.position,
                              lng: parseFloat(e.target.value)
                            }
                          })}
                        />
                      ) : (
                        <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                          {editedElement.position.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Capacidade</Label>
                    {isEditingElement ? (
                      <Input
                        type="number"
                        value={editedElement.properties.capacity}
                        onChange={(e) => setEditedElement({
                          ...editedElement,
                          properties: {
                            ...editedElement.properties,
                            capacity: parseInt(e.target.value)
                          }
                        })}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                        {editedElement.properties.capacity}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Utilização</Label>
                    {isEditingElement ? (
                      <Input
                        type="number"
                        value={editedElement.properties.utilization}
                        onChange={(e) => setEditedElement({
                          ...editedElement,
                          properties: {
                            ...editedElement.properties,
                            utilization: parseInt(e.target.value)
                          }
                        })}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                        {editedElement.properties.utilization} / {editedElement.properties.capacity}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Endereço</Label>
                  {isEditingElement ? (
                    <Input
                      value={editedElement.properties.address}
                      onChange={(e) => setEditedElement({
                        ...editedElement,
                        properties: {
                          ...editedElement.properties,
                          address: e.target.value
                        }
                      })}
                    />
                  ) : (
                    <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                      {editedElement.properties.address || "Não especificado"}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label>Observações</Label>
                  {isEditingElement ? (
                    <Textarea
                      value={editedElement.properties.notes}
                      onChange={(e) => setEditedElement({
                        ...editedElement,
                        properties: {
                          ...editedElement.properties,
                          notes: e.target.value
                        }
                      })}
                      rows={3}
                    />
                  ) : (
                    <div className="px-3 py-2 border rounded-md bg-gray-50 min-h-[80px]">
                      {editedElement.properties.notes || "Sem observações"}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="connections">
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-gray-500">Elementos Conectados</h3>
                {/* Lista de conexões do elemento */}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="destructive"
            onClick={() => onRemoveElement(editedElement.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remover
          </Button>
          
          {isEditingElement && (
            <Button
              onClick={handleSaveElement}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  if (editedCable) {
    const startElement = findElementById(editedCable.start);
    const endElement = findElementById(editedCable.end);

    return (
      <Card className="h-full overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: cableTypes[editedCable.type].color }}
                ></span>
                {cableTypes[editedCable.type].name}
              </CardTitle>
              <CardDescription>
                {cableTypes[editedCable.type].description}
              </CardDescription>
            </div>
            <div>
              {isEditingCable ? (
                <Button size="sm" variant="outline" onClick={() => setIsEditingCable(false)}>
                  Cancelar
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditingCable(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Cabo</Label>
              {isEditingCable ? (
                <Select
                  value={editedCable.type}
                  onValueChange={(value) => setEditedCable({...editedCable, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(cableTypes).map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center">
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: cableTypes[type].color }}
                          ></span>
                          {cableTypes[type].name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: cableTypes[editedCable.type].color }}
                  ></span>
                  {cableTypes[editedCable.type].name}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Conexão</Label>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Box className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Origem:</span>
                  <span>{startElement ? startElement.name : "Elemento não encontrado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Destino:</span>
                  <span>{endElement ? endElement.name : "Elemento não encontrado"}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                {isEditingCable ? (
                  <Select
                    value={editedCable.status}
                    onValueChange={(value) => setEditedCable({...editedCable, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="planned">Planejado</SelectItem>
                      <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                    {editedCable.status === "active" && (
                      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Ativo
                      </Badge>
                    )}
                    {editedCable.status === "inactive" && (
                      <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Inativo
                      </Badge>
                    )}
                    {editedCable.status === "planned" && (
                      <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Planejado
                      </Badge>
                    )}
                    {editedCable.status === "maintenance" && (
                      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Em Manutenção
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <Label>Comprimento</Label>
                <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                  <Ruler className="h-4 w-4 mr-1 text-gray-400" />
                  {editedCable.properties.length} km
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fibras</Label>
                {isEditingCable ? (
                  <Input
                    type="number"
                    value={editedCable.properties.fibers}
                    onChange={(e) => setEditedCable({
                      ...editedCable,
                      properties: {
                        ...editedCable.properties,
                        fibers: parseInt(e.target.value)
                      }
                    })}
                  />
                ) : (
                  <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                    <Cable className="h-4 w-4 mr-1 text-gray-400" />
                    {editedCable.properties.fibers} fibras
                  </div>
                )}
              </div>
              
              <div>
                <Label>Utilização</Label>
                {isEditingCable ? (
                  <Input
                    type="number"
                    value={editedCable.properties.utilization}
                    onChange={(e) => setEditedCable({
                      ...editedCable,
                      properties: {
                        ...editedCable.properties,
                        utilization: parseInt(e.target.value)
                      }
                    })}
                  />
                ) : (
                  <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                    {editedCable.properties.utilization} / {editedCable.properties.fibers}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label>Observações</Label>
              {isEditingCable ? (
                <Textarea
                  value={editedCable.properties.notes}
                  onChange={(e) => setEditedCable({
                    ...editedCable,
                    properties: {
                      ...editedCable.properties,
                      notes: e.target.value
                    }
                  })}
                  rows={3}
                />
              ) : (
                <div className="px-3 py-2 border rounded-md bg-gray-50 min-h-[80px]">
                  {editedCable.properties.notes || "Sem observações"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="destructive"
            onClick={() => onRemoveCable(editedCable.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remover
          </Button>
          
          {isEditingCable && (
            <Button
              onClick={handleSaveCable}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
}