import React, { useState, useEffect } from "react";
import { Equipment } from "@/api/entities";
import { Customer } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  WifiOff,
  Search,
  Plus,
  Filter,
  Layers,
  Server,
  Router,
  Radio,
  Monitor,
  Settings
} from "lucide-react";
import EquipmentForm from "../components/equipment/EquipmentForm";
import EquipmentDetails from "../components/equipment/EquipmentDetails";

const statusColors = {
  online: "bg-green-100 text-green-800",
  offline: "bg-red-100 text-red-800",
  manutenção: "bg-yellow-100 text-yellow-800",
  reserva: "bg-gray-100 text-gray-800",
};

const typeIcons = {
  router: <Router className="w-4 h-4" />,
  switch: <Layers className="w-4 h-4" />,
  ont: <Wifi className="w-4 h-4" />,
  olt: <Server className="w-4 h-4" />,
  radio: <Radio className="w-4 h-4" />,
  servidor: <Monitor className="w-4 h-4" />,
  outro: <Settings className="w-4 h-4" />
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const equipmentData = await Equipment.list();
      const customersData = await Customer.list();
      
      setEquipment(equipmentData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && item.type === filter;
  });

  const handleSubmit = async (equipmentData) => {
    try {
      if (selectedEquipment) {
        await Equipment.update(selectedEquipment.id, equipmentData);
      } else {
        await Equipment.create(equipmentData);
      }
      setShowForm(false);
      setSelectedEquipment(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);
    }
  };

  const handleEdit = (item) => {
    setSelectedEquipment(item);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleViewDetails = (item) => {
    setSelectedEquipment(item);
    setShowDetails(true);
    setShowForm(false);
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.full_name : "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Equipamentos</h1>
        <Button onClick={() => {
          setShowForm(true);
          setSelectedEquipment(null);
          setShowDetails(false);
        }} className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Equipamento
        </Button>
      </div>

      {showForm && (
        <EquipmentForm
          equipment={selectedEquipment}
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedEquipment(null);
          }}
        />
      )}

      {showDetails && selectedEquipment && (
        <EquipmentDetails
          equipment={selectedEquipment}
          customerName={getCustomerName(selectedEquipment.customer_id)}
          onEdit={() => handleEdit(selectedEquipment)}
          onClose={() => setShowDetails(false)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select block w-full mt-1"
              >
                <option value="">Todos os tipos</option>
                <option value="router">Roteadores</option>
                <option value="switch">Switches</option>
                <option value="ap">Access Points</option>
                <option value="onu">ONUs</option>
                <option value="server">Servidores</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Localização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="mt-2 text-gray-500">Carregando equipamentos...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-gray-500">Nenhum equipamento encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewDetails(item)}
                    >
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {typeIcons[item.type]}
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.ip_address}</TableCell>
                      <TableCell>{item.customer_id ? getCustomerName(item.customer_id) : "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[item.status]}
                        >
                          <span className="flex items-center gap-1">
                            {item.status === "online" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {item.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>{item.location || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}