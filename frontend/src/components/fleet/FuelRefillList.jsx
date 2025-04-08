import React, { useState, useEffect } from "react";
import { FuelRefill } from "@/api/entities";
import { Vehicle } from "@/api/entities";
import { Driver } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreVertical,
  PencilLine,
  Trash2,
  CircleAlert,
  RotateCw,
  Filter,
  Fuel,
} from "lucide-react";
import FuelRefillForm from "./FuelRefillForm";

export default function FuelRefillList() {
  const [refills, setRefills] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRefill, setSelectedRefill] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const refillsData = await FuelRefill.list("-date");
      const vehiclesData = await Vehicle.list();
      const driversData = await Driver.list();
      
      setRefills(refillsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVehiclePlate = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.model} (${vehicle.plate})` : "Veículo desconhecido";
  };

  const getDriverName = (driverId) => {
    if (!driverId) return "Não informado";
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : "Motorista desconhecido";
  };

  const handleAddRefill = async (refillData) => {
    try {
      await FuelRefill.create(refillData);
      setIsAddDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar abastecimento:", error);
    }
  };

  const handleEditRefill = async (refillData) => {
    try {
      await FuelRefill.update(selectedRefill.id, refillData);
      setIsEditDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao editar abastecimento:", error);
    }
  };

  const handleDeleteRefill = async () => {
    try {
      await FuelRefill.delete(selectedRefill.id);
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir abastecimento:", error);
    }
  };

  const filteredRefills = refills.filter(refill => {
    const matchesVehicle = selectedVehicle === "all" || refill.vehicle_id === selectedVehicle;
    
    const matchesSearch = 
      getVehiclePlate(refill.vehicle_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      refill.gas_station?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refill.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesVehicle && matchesSearch;
  });

  const fuelTypeColors = {
    gasolina: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    etanol: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    diesel: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    gnv: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Fuel className="h-5 w-5 text-green-600 dark:text-green-400" />
            Abastecimentos
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Abastecimento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por veículo ou posto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="all">Todos os Veículos</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.model} ({vehicle.plate})
                </option>
              ))}
            </select>
            <Button variant="outline" size="icon" onClick={loadData}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : filteredRefills.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Fuel className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium">Nenhum abastecimento encontrado</h3>
            <p className="mt-1">
              {searchQuery || selectedVehicle !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Adicione seu primeiro abastecimento para começar"}
            </p>
          </div>
        ) : (
          <div className="border rounded-md dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead>Veículo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Km</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Posto</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefills.map((refill) => (
                  <TableRow key={refill.id}>
                    <TableCell className="font-medium">{getVehiclePlate(refill.vehicle_id)}</TableCell>
                    <TableCell>{new Date(refill.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{refill.liters.toFixed(2)} L</TableCell>
                    <TableCell>R$ {refill.total_cost.toFixed(2)}</TableCell>
                    <TableCell>{refill.odometer} km</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={fuelTypeColors[refill.fuel_type] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}
                      >
                        {refill.fuel_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{refill.gas_station || "Não informado"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRefill(refill);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <PencilLine className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRefill(refill);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Diálogo para adicionar abastecimento */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Novo Abastecimento</DialogTitle>
            <DialogDescription>
              Registre os dados do abastecimento de combustível.
            </DialogDescription>
          </DialogHeader>
          <FuelRefillForm 
            onSubmit={handleAddRefill} 
            vehicles={vehicles} 
            drivers={drivers}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar abastecimento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Abastecimento</DialogTitle>
            <DialogDescription>
              Modifique os dados do abastecimento selecionado.
            </DialogDescription>
          </DialogHeader>
          {selectedRefill && (
            <FuelRefillForm 
              refill={selectedRefill} 
              onSubmit={handleEditRefill} 
              vehicles={vehicles}
              drivers={drivers}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <CircleAlert className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro 
              de abastecimento do dia{" "}
              <span className="font-semibold">
                {selectedRefill && new Date(selectedRefill.date).toLocaleDateString('pt-BR')}
              </span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRefill}
            >
              Excluir Abastecimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}