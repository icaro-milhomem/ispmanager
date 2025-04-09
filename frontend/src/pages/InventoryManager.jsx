import React, { useState, useEffect } from "react";
import { Equipment } from "@/api/entities";
import { EquipmentBrand } from "@/api/entities";
import { InventoryItem } from "@/api/entities";
import { InventoryTransaction } from "@/api/entities";
import { Customer } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  Plus,
  Trash,
  Edit,
  Package,
  Box,
  Truck,
  QrCode,
  FileText,
  AlertTriangle,
  BarChart,
  Search,
  RefreshCw,
  Wifi,
  Link as LinkIcon,
  Upload,
  Check,
  Clipboard,
  Eye
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState("equipamentos");
  const [equipment, setEquipment] = useState([]);
  const [brands, setBrands] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showMacCaptureForm, setShowMacCaptureForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeScannerActive, setBarcodeScannerActive] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [capturedMAC, setCapturedMAC] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: "", message: "" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [equipmentInventory, setEquipmentInventory] = useState({});
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const brandsData = await EquipmentBrand.list();
      const equipmentData = await Equipment.list();
      const itemsData = await InventoryItem.list();
      const transactionsData = await InventoryTransaction.list();
      const customersData = await Customer.list();
      
      setBrands(brandsData);
      setEquipment(equipmentData);
      setInventoryItems(itemsData);
      setTransactions(transactionsData);
      setCustomers(customersData);
      
      calculateEquipmentInventory(equipmentData);
      
      identifyLowStockItems(itemsData);
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setAlertMessage({
        type: "error",
        message: "Erro ao carregar dados do estoque."
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEquipmentInventory = (equipmentData) => {
    const inventory = {};
    
    equipmentData.forEach(eq => {
      if (eq.status === "disponível") {
        const key = `${eq.brand_id}:${eq.model}`;
        
        if (!inventory[key]) {
          inventory[key] = {
            brand_id: eq.brand_id,
            model: eq.model,
            count: 0,
            type: eq.type
          };
        }
        
        inventory[key].count++;
      }
    });
    
    setEquipmentInventory(inventory);
  };

  const identifyLowStockItems = (items) => {
    const lowStock = items.filter(item => 
      item.quantity <= (item.minimum_quantity || 0)
    );
    
    setLowStockItems(lowStock);
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formData = {
        name: e.target.name.value,
        description: e.target.description.value,
        website: e.target.website.value,
        support_contact: e.target.support_contact.value,
        is_active: true
      };
      
      if (selectedBrand) {
        await EquipmentBrand.update(selectedBrand.id, formData);
        setAlertMessage({
          type: "success",
          message: "Marca atualizada com sucesso!"
        });
      } else {
        await EquipmentBrand.create(formData);
        setAlertMessage({
          type: "success",
          message: "Marca cadastrada com sucesso!"
        });
      }
      
      setShowBrandForm(false);
      setSelectedBrand(null);
      loadData();
      
    } catch (error) {
      console.error("Erro ao salvar marca:", error);
      setAlertMessage({
        type: "error",
        message: "Erro ao salvar a marca."
      });
    } finally {
      setLoading(false);
    }
  };

  const editBrand = (brand) => {
    setSelectedBrand(brand);
    setShowBrandForm(true);
  };

  const handleEquipmentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formData = {
        name: e.target.name.value,
        type: e.target.type.value,
        brand_id: e.target.brand_id.value,
        model: e.target.model.value,
        description: e.target.description.value,
        serial_number: e.target.serial_number.value,
        barcode: e.target.barcode.value,
        mac_address: e.target.mac_address.value,
        purchase_price: parseFloat(e.target.purchase_price.value) || 0,
        purchase_date: e.target.purchase_date.value,
        warranty_expires: e.target.warranty_expires.value,
        status: "disponível",
        location: e.target.location.value,
        notes: e.target.notes.value
      };
      
      const quantity = parseInt(e.target.quantity.value, 10) || 1;
      
      if (selectedEquipment) {
        await Equipment.update(selectedEquipment.id, formData);
        
        await InventoryTransaction.create({
          transaction_type: "ajuste",
          item_type: "equipment",
          item_id: selectedEquipment.id,
          quantity: 1,
          previous_quantity: 1,
          reason: "Atualização de equipamento",
          transaction_date: new Date().toISOString()
        });
        
        setAlertMessage({
          type: "success",
          message: "Equipamento atualizado com sucesso!"
        });
      } else {
        const equipmentPromises = [];
        
        for (let i = 0; i < quantity; i++) {
          if (quantity > 1) {
            const suffix = `-${i + 1}`;
            formData.serial_number = `${formData.serial_number}${suffix}`;
            if (formData.barcode) {
              formData.barcode = `${formData.barcode}${suffix}`;
            }
          }
          
          equipmentPromises.push(Equipment.create({...formData}));
        }
        
        await Promise.all(equipmentPromises);
        
        await InventoryTransaction.create({
          transaction_type: "entrada",
          item_type: "equipment",
          item_id: formData.brand_id + ":" + formData.model,
          quantity: quantity,
          previous_quantity: 0,
          reason: "Entrada de novos equipamentos",
          transaction_date: new Date().toISOString()
        });
        
        setAlertMessage({
          type: "success",
          message: `${quantity} equipamento(s) cadastrado(s) com sucesso!`
        });
      }
      
      setShowEquipmentForm(false);
      setSelectedEquipment(null);
      loadData();
      
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);
      setAlertMessage({
        type: "error",
        message: "Erro ao salvar o equipamento."
      });
    } finally {
      setLoading(false);
    }
  };

  const editEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setShowEquipmentForm(true);
  };

  const handleMacCapture = async () => {
    try {
      setLoading(true);
      
      const macResponse = await InvokeLLM({
        prompt: "Gere um endereço MAC válido formatado como XX:XX:XX:XX:XX:XX para simular a captura automática de um dispositivo ONT/ONU conectado à rede.",
        response_json_schema: {
          type: "object",
          properties: {
            mac_address: { type: "string" },
            device_info: { type: "string" }
          }
        }
      });
      
      if (macResponse && macResponse.mac_address) {
        setCapturedMAC(macResponse.mac_address);
        
        setAlertMessage({
          type: "success",
          message: `MAC Address capturado com sucesso: ${macResponse.mac_address}`
        });
      } else {
        setAlertMessage({
          type: "error",
          message: "Não foi possível capturar o MAC automaticamente."
        });
      }
      
    } catch (error) {
      console.error("Erro ao capturar MAC:", error);
      setAlertMessage({
        type: "error",
        message: "Erro ao capturar MAC automaticamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentAssignment = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer || !capturedMAC) {
      setAlertMessage({
        type: "error",
        message: "Selecione um cliente e capture o MAC do equipamento."
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const brandId = e.target.brand_id.value;
      const model = e.target.model.value;
      
      const availableEquipment = equipment.find(eq => 
        eq.brand_id === brandId && 
        eq.model === model && 
        eq.status === "disponível"
      );
      
      if (!availableEquipment) {
        setAlertMessage({
          type: "error",
          message: "Não há equipamentos disponíveis com a marca e modelo selecionados."
        });
        return;
      }
      
      await Equipment.update(availableEquipment.id, {
        mac_address: capturedMAC,
        customer_id: selectedCustomer.id,
        status: "em_uso",
        installed_date: new Date().toISOString().split("T")[0]
      });
      
      await InventoryTransaction.create({
        transaction_type: "instalação",
        item_type: "equipment",
        item_id: availableEquipment.id,
        quantity: 1,
        previous_quantity: 1,
        customer_id: selectedCustomer.id,
        reason: "Instalação de equipamento no cliente",
        transaction_date: new Date().toISOString()
      });
      
      await Customer.update(selectedCustomer.id, {
        equipment_mac: capturedMAC
      });
      
      setAlertMessage({
        type: "success",
        message: `Equipamento associado com sucesso ao cliente ${selectedCustomer.full_name}!`
      });
      
      setShowMacCaptureForm(false);
      setCapturedMAC("");
      setSelectedCustomer(null);
      loadData();
      
    } catch (error) {
      console.error("Erro ao associar equipamento:", error);
      setAlertMessage({
        type: "error",
        message: "Erro ao associar equipamento ao cliente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeInput = (e) => {
    setBarcodeInput(e.target.value);
  };

  const handleBarcodeSubmit = () => {
    if (!barcodeInput) return;
    
    const foundEquipment = equipment.find(eq => eq.barcode === barcodeInput);
    if (foundEquipment) {
      editEquipment(foundEquipment);
    } else {
      setAlertMessage({
        type: "error",
        message: `Nenhum equipamento encontrado com o código ${barcodeInput}`
      });
    }
    
    setBarcodeInput("");
  };

  const filteredEquipment = React.useMemo(() => {
    if (!searchTerm) return equipment;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return equipment.filter(eq => 
      eq.name?.toLowerCase().includes(searchTermLower) ||
      eq.model?.toLowerCase().includes(searchTermLower) ||
      eq.serial_number?.toLowerCase().includes(searchTermLower) ||
      eq.barcode?.toLowerCase().includes(searchTermLower) ||
      eq.mac_address?.toLowerCase().includes(searchTermLower) ||
      getBrandName(eq.brand_id)?.toLowerCase().includes(searchTermLower)
    );
  }, [equipment, searchTerm]);

  const getBrandName = (brandId) => {
    if (!brandId) return "Desconhecida";
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : "Desconhecida";
  };

  const getCustomerName = (customerId) => {
    if (!customerId) return "Desconhecido";
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.full_name : "Desconhecido";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Estoque</h1>
          <p className="text-gray-500">Controle de equipamentos e insumos</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar no estoque..."
              className="pl-9 w-full md:w-[240px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button onClick={() => setBarcodeScannerActive(!barcodeScannerActive)} variant="outline" className="gap-2">
            <QrCode className="h-4 w-4" />
            {barcodeScannerActive ? "Fechar Scanner" : "Ler Código de Barras"}
          </Button>
          
          <Button onClick={loadData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {barcodeScannerActive && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input 
                placeholder="Escaneie ou digite o código de barras..." 
                value={barcodeInput}
                onChange={handleBarcodeInput}
                autoFocus
                className="flex-1"
              />
              <Button onClick={handleBarcodeSubmit}>Buscar</Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Posicione o leitor de código de barras sobre o equipamento ou digite o código manualmente.
            </p>
          </CardContent>
        </Card>
      )}

      {alertMessage.message && (
        <Alert variant={alertMessage.type === "error" ? "destructive" : "default"} className={alertMessage.type === "success" ? "bg-green-50 text-green-800 border-green-200" : ""}>
          <AlertTitle>
            {alertMessage.type === "success" ? "Sucesso!" : "Atenção!"}
          </AlertTitle>
          <AlertDescription>
            {alertMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {lowStockItems.length > 0 && (
        <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alerta de Estoque Baixo</AlertTitle>
          <AlertDescription>
            {lowStockItems.length} item(s) estão com estoque abaixo do mínimo recomendado.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="marcas">Marcas</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="equipamentos" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Gestão de Equipamentos</h2>
            <div className="flex gap-3">
              <Button onClick={() => setShowEquipmentForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Equipamento
              </Button>
              <Button onClick={() => setShowMacCaptureForm(true)} variant="outline" className="gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                <LinkIcon className="h-4 w-4" />
                Associar Equipamento
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total em Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {equipment.filter(eq => eq.status === "disponível").length}
                </div>
                <p className="text-sm text-gray-500">equipamentos disponíveis</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Em Uso por Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {equipment.filter(eq => eq.status === "em_uso").length}
                </div>
                <p className="text-sm text-gray-500">equipamentos instalados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Manutenção/Defeito</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {equipment.filter(eq => ["em_manutenção", "defeituoso"].includes(eq.status)).length}
                </div>
                <p className="text-sm text-gray-500">equipamentos não disponíveis</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Equipamentos por Marca/Modelo</CardTitle>
              <CardDescription>Resumo de disponibilidade em estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Quantidade Disponível</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(equipmentInventory).length > 0 ? (
                      Object.values(equipmentInventory).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{getBrandName(item.brand_id)}</TableCell>
                          <TableCell>{item.model}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.type === "ont" ? "ONT/ONU" : 
                               item.type === "router" ? "Roteador" : 
                               item.type === "switch" ? "Switch" : 
                               item.type === "olt" ? "OLT" : item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.count} unidade(s)
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          Nenhum equipamento disponível em estoque
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Equipamentos</CardTitle>
              <CardDescription>Todos os equipamentos cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Marca/Modelo</TableHead>
                      <TableHead>Serial/MAC</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.length > 0 ? (
                      filteredEquipment.map((eq) => (
                        <TableRow key={eq.id}>
                          <TableCell>
                            <div className="font-medium">{eq.name}</div>
                            <div className="text-sm text-gray-500">{eq.type}</div>
                          </TableCell>
                          <TableCell>
                            {getBrandName(eq.brand_id)}
                            <div className="text-sm text-gray-500">{eq.model}</div>
                          </TableCell>
                          <TableCell>
                            <div>{eq.serial_number}</div>
                            {eq.mac_address && (
                              <div className="text-sm text-gray-500">{eq.mac_address}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                eq.status === "disponível" ? "bg-green-50 text-green-700 border-green-200" :
                                eq.status === "em_uso" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                eq.status === "em_manutenção" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                "bg-red-50 text-red-700 border-red-200"
                              }
                            >
                              {eq.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {eq.customer_id ? (
                              getCustomerName(eq.customer_id)
                            ) : (
                              <span className="text-gray-400">Nenhum</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => editEquipment(eq)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          Nenhum equipamento encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marcas" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Marcas de Equipamentos</h2>
            <Button onClick={() => {
              setSelectedBrand(null);
              setShowBrandForm(true);
            }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Marca
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands.length > 0 ? (
                      brands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell>{brand.description}</TableCell>
                          <TableCell>
                            <div>{brand.support_contact}</div>
                            {brand.website && (
                              <div className="text-sm text-blue-600">
                                <a href={brand.website} target="_blank" rel="noopener noreferrer">
                                  {brand.website}
                                </a>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={brand.is_active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}
                            >
                              {brand.is_active ? "Ativa" : "Inativa"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => editBrand(brand)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                          Nenhuma marca cadastrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiais">
          <Card>
            <CardHeader>
              <CardTitle>Materiais e Insumos</CardTitle>
              <CardDescription>Gestão de materiais passivos e consumíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Gestão de Materiais</h3>
                <p>Módulo em desenvolvimento. Em breve você poderá gerenciar cabos, conectores e insumos.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>Registro de entradas, saídas e movimentações de estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Registro de Movimentações</h3>
                <p>Módulo em desenvolvimento. Em breve você poderá visualizar todas as movimentações do estoque.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showBrandForm} onOpenChange={setShowBrandForm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{selectedBrand ? "Editar Marca" : "Nova Marca"}</DialogTitle>
            <DialogDescription>
              Cadastre as marcas de equipamentos utilizados no provedor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBrandSubmit}>
            <div className="grid gap-3 py-3">
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedBrand?.name || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={selectedBrand?.description || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="website" className="text-right">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  defaultValue={selectedBrand?.website || ""}
                  className="col-span-3"
                  placeholder="https://"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="support_contact" className="text-right">
                  Contato
                </Label>
                <Input
                  id="support_contact"
                  name="support_contact"
                  defaultValue={selectedBrand?.support_contact || ""}
                  className="col-span-3"
                  placeholder="Email ou telefone"
                />
              </div>
            </div>
            <DialogFooter className="mt-3">
              <Button type="button" variant="outline" onClick={() => setShowBrandForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : selectedBrand ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEquipmentForm} onOpenChange={setShowEquipmentForm}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEquipment ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle>
            <DialogDescription>
              {selectedEquipment 
                ? "Edite as informações do equipamento existente" 
                : "Preencha as informações para cadastrar um novo equipamento"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEquipmentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Equipamento</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedEquipment?.name || ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select name="type" defaultValue={selectedEquipment?.type || "ont"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ont">ONT/ONU</SelectItem>
                      <SelectItem value="router">Roteador</SelectItem>
                      <SelectItem value="switch">Switch</SelectItem>
                      <SelectItem value="olt">OLT</SelectItem>
                      <SelectItem value="radio">Rádio</SelectItem>
                      <SelectItem value="servidor">Servidor</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_id">Marca</Label>
                  <Select name="brand_id" defaultValue={selectedEquipment?.brand_id || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    name="model"
                    defaultValue={selectedEquipment?.model || ""}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Número de Série</Label>
                  <Input
                    id="serial_number"
                    name="serial_number"
                    defaultValue={selectedEquipment?.serial_number || ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    defaultValue={selectedEquipment?.barcode || ""}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mac_address">MAC Address</Label>
                <Input
                  id="mac_address"
                  name="mac_address"
                  defaultValue={selectedEquipment?.mac_address || ""}
                  placeholder="XX:XX:XX:XX:XX:XX"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Preço de Compra (R$)</Label>
                  <Input
                    id="purchase_price"
                    name="purchase_price"
                    type="number"
                    defaultValue={selectedEquipment?.purchase_price || ""}
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Data de Compra</Label>
                  <Input
                    id="purchase_date"
                    name="purchase_date"
                    type="date"
                    defaultValue={selectedEquipment?.purchase_date || new Date().toISOString().split("T")[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="warranty_expires">Garantia até</Label>
                  <Input
                    id="warranty_expires"
                    name="warranty_expires"
                    type="date"
                    defaultValue={selectedEquipment?.warranty_expires || ""}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={selectedEquipment?.location || ""}
                  placeholder="Prateleira, depósito, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={selectedEquipment?.description || ""}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={selectedEquipment?.notes || ""}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEquipmentForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600">
                {loading ? "Salvando..." : selectedEquipment ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showMacCaptureForm} onOpenChange={setShowMacCaptureForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Associar Equipamento ao Cliente</DialogTitle>
            <DialogDescription>
              Capture automaticamente o MAC Address e associe um equipamento ao cliente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEquipmentAssignment}>
            <div className="grid gap-3 py-3">
              <div className="space-y-1">
                <Label htmlFor="customer_id">Cliente</Label>
                <Select 
                  onValueChange={(value) => {
                    const customer = customers.find(c => c.id === value);
                    setSelectedCustomer(customer);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label>Capturar MAC Address</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={capturedMAC}
                      onChange={(e) => setCapturedMAC(e.target.value)}
                      placeholder="XX:XX:XX:XX:XX:XX"
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleMacCapture}
                    variant="outline"
                    className="shrink-0"
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    Capturar
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Conecte o dispositivo à rede e clique em "Capturar" para detectar automaticamente.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="brand_id">Marca</Label>
                  <Select name="brand_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    name="model"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-3">
              <Button type="button" variant="outline" onClick={() => {
                setShowMacCaptureForm(false);
                setCapturedMAC("");
                setSelectedCustomer(null);
              }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !capturedMAC || !selectedCustomer}>
                {loading ? "Processando..." : "Associar Equipamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
