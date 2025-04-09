import React, { useState, useEffect } from "react";
import { MileageLog } from "@/api/entities";
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
import {
  Plus,
  Search,
  MoreVertical,
  PencilLine,
  Trash2,
  CircleAlert,
  RotateCw,
  MapPin,
} from "lucide-react";
import MileageLogForm from "./MileageLogForm";

export default function MileageLogList() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && data.length) return Array.from(data);
    if (data && typeof data === 'object') return Object.values(data).filter(item => item && typeof item === 'object');
    return [];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Carregando registros de quilometragem...");
      const logsData = await MileageLog.list();
      console.log("Registros de quilometragem carregados:", logsData);
      
      console.log("Carregando veículos...");
      const vehiclesData = await Vehicle.list();
      console.log("Veículos carregados:", vehiclesData);
      
      console.log("Carregando motoristas...");
      const driversData = await Driver.list();
      console.log("Motoristas carregados:", driversData);
      
      setLogs(ensureArray(logsData));
      setVehicles(ensureArray(vehiclesData));
      setDrivers(ensureArray(driversData));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLogs([]);
      setVehicles([]);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const getVehiclePlate = (vehicleId) => {
    if (!vehicleId) return "Veículo desconhecido";
    if (!Array.isArray(vehicles)) return "Veículo desconhecido";
    const vehicle = vehicles.find(v => v && v.id === vehicleId);
    return vehicle ? vehicle.plate : "Veículo desconhecido";
  };

  const getDriverName = (driverId) => {
    if (!driverId) return "Motorista desconhecido";
    if (!Array.isArray(drivers)) return "Motorista desconhecido";
    const driver = drivers.find(d => d && d.id === driverId);
    return driver ? driver.name : "Motorista desconhecido";
  };

  const handleAddLog = async (logData) => {
    try {
      await MileageLog.create(logData);
      setIsAddDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar registro:", error);
    }
  };

  const handleEditLog = async (logData) => {
    try {
      await MileageLog.update(selectedLog.id, logData);
      setIsEditDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao editar registro:", error);
    }
  };

  const handleDeleteLog = async () => {
    try {
      await MileageLog.delete(selectedLog.id);
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
    }
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    if (!log) return false;
    
    const matchesVehicle = selectedVehicle === "all" || log.vehicle_id === selectedVehicle;
    
    const searchLower = searchQuery.toLowerCase();
    const vehiclePlate = getVehiclePlate(log.vehicle_id).toLowerCase();
    const driverName = getDriverName(log.driver_id).toLowerCase();
    const date = log.date ? new Date(log.date).toLocaleDateString() : "";
    
    const matchesSearch = 
      vehiclePlate.includes(searchLower) ||
      driverName.includes(searchLower) ||
      date.includes(searchLower);
    
    return matchesVehicle && matchesSearch;
  }) : [];

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Registros de Quilometragem
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por veículo, finalidade ou rota..."
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
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium">Nenhum registro de quilometragem encontrado</h3>
            <p className="mt-1">
              {searchQuery || selectedVehicle !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Adicione seu primeiro registro para começar"}
            </p>
          </div>
        ) : (
          <div className="border rounded-md dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead>Veículo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Km Inicial</TableHead>
                  <TableHead>Km Final</TableHead>
                  <TableHead>Distância</TableHead>
                  <TableHead>Finalidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{getVehiclePlate(log.vehicle_id)}</TableCell>
                    <TableCell>{new Date(log.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{getDriverName(log.driver_id)}</TableCell>
                    <TableCell>{log.start_odometer} km</TableCell>
                    <TableCell>{log.end_odometer} km</TableCell>
                    <TableCell>{log.distance} km</TableCell>
                    <TableCell>{log.purpose || "Não informado"}</TableCell>
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
                              setSelectedLog(log);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <PencilLine className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedLog(log);
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

      {/* Diálogo para adicionar registro */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Novo Registro de Quilometragem</DialogTitle>
            <DialogDescription>
              Registre os dados da viagem e quilometragem.
            </DialogDescription>
          </DialogHeader>
          <MileageLogForm 
            onSubmit={handleAddLog} 
            vehicles={vehicles} 
            drivers={drivers}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar registro */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>
              Modifique os dados do registro selecionado.
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <MileageLogForm 
              log={selectedLog} 
              onSubmit={handleEditLog} 
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
              de quilometragem do dia{" "}
              <span className="font-semibold">
                {selectedLog && new Date(selectedLog.date).toLocaleDateString('pt-BR')}
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
              onClick={handleDeleteLog}
            >
              Excluir Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}