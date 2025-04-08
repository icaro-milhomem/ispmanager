import React, { useState, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Car,
  Plus,
  PencilLine,
  Trash2,
  MoreVertical,
  Search,
  CircleAlert,
  FileSpreadsheet,
  RotateCw,
  Filter,
} from "lucide-react";
import VehicleForm from "./VehicleForm";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const vehiclesData = await Vehicle.list();
      const driversData = await Driver.list();
      
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDriverName = (driverId) => {
    if (!driverId) return "Não atribuído";
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : "Motorista não encontrado";
  };

  const handleAddVehicle = async (vehicleData) => {
    try {
      await Vehicle.create(vehicleData);
      setIsAddDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
    }
  };

  const handleEditVehicle = async (vehicleData) => {
    try {
      await Vehicle.update(selectedVehicle.id, vehicleData);
      setIsEditDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao editar veículo:", error);
    }
  };

  const handleDeleteVehicle = async () => {
    try {
      await Vehicle.delete(selectedVehicle.id);
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir veículo:", error);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "todos" || vehicle.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusColor = {
    ativo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    inativo: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    manutenção: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    vendido: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Veículos
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Veículo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por modelo ou placa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto gap-1">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterStatus("todos")}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("ativo")}>
                Ativos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("manutenção")}>
                Em Manutenção
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("inativo")}>
                Inativos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={loadData}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Car className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium">Nenhum veículo encontrado</h3>
            <p className="mt-1">
              {searchQuery
                ? "Tente ajustar sua busca"
                : "Adicione seu primeiro veículo para começar"}
            </p>
          </div>
        ) : (
          <div className="border rounded-md dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead>Modelo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.model}</TableCell>
                    <TableCell>{vehicle.plate}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell className="capitalize">{vehicle.fuel_type}</TableCell>
                    <TableCell>{getDriverName(vehicle.driver_id)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColor[vehicle.status] || "bg-gray-100 text-gray-800"}
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
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
                              setSelectedVehicle(vehicle);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <PencilLine className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedVehicle(vehicle);
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

      {/* Diálogo para adicionar veículo */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Adicionar Veículo</DialogTitle>
            <DialogDescription>
              Preencha os dados do veículo a ser adicionado à frota.
            </DialogDescription>
          </DialogHeader>
          <VehicleForm onSubmit={handleAddVehicle} drivers={drivers} />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar veículo */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>
              Modifique os dados do veículo selecionado.
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <VehicleForm 
              vehicle={selectedVehicle} 
              onSubmit={handleEditVehicle} 
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o veículo{" "}
              <span className="font-semibold">
                {selectedVehicle?.model} ({selectedVehicle?.plate})
              </span>{" "}
              e todos os dados associados.
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
              onClick={handleDeleteVehicle}
            >
              Excluir Veículo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}