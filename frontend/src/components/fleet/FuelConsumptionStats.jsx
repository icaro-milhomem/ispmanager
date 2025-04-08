import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FuelRefill } from "@/api/entities";
import { Vehicle } from "@/api/entities";
import { MileageLog } from "@/api/entities";
import { Spinner } from "@/components/ui/spinner";
import { BarChart, LineChart, PieChart } from "recharts";
import {
  Car,
  Fuel,
  TrendingUp,
  DollarSign,
  BarChart3,
  LineChart as LineChartIcon,
  CircleOff,
} from "lucide-react";

export default function FuelConsumptionStats() {
  const [isLoading, setIsLoading] = useState(true);
  const [refills, setRefills] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [mileageLogs, setMileageLogs] = useState([]);
  const [period, setPeriod] = useState("month");
  const [selectedVehicle, setSelectedVehicle] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const refillsData = await FuelRefill.list("-date");
      const vehiclesData = await Vehicle.list();
      const mileageLogsData = await MileageLog.list("-date");
      
      setRefills(refillsData);
      setVehicles(vehiclesData);
      setMileageLogs(mileageLogsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on selected period and vehicle
  const getFilteredData = () => {
    const now = new Date();
    let startDate;

    // Determine start date based on period
    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else if (period === "quarter") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    } else if (period === "year") {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }

    // Filter refills by date and vehicle if specified
    const filteredRefills = refills.filter(refill => {
      const refillDate = new Date(refill.date);
      const matchesDate = refillDate >= startDate;
      const matchesVehicle = selectedVehicle === "all" || refill.vehicle_id === selectedVehicle;
      return matchesDate && matchesVehicle;
    });

    // Filter mileage logs by date and vehicle if specified
    const filteredLogs = mileageLogs.filter(log => {
      const logDate = new Date(log.date);
      const matchesDate = logDate >= startDate;
      const matchesVehicle = selectedVehicle === "all" || log.vehicle_id === selectedVehicle;
      return matchesDate && matchesVehicle;
    });

    return {
      refills: filteredRefills,
      logs: filteredLogs
    };
  };

  // Calculate statistics
  const calculateStats = () => {
    const { refills: filteredRefills, logs: filteredLogs } = getFilteredData();
    
    const totalFuelCost = filteredRefills.reduce((sum, refill) => sum + refill.total_cost, 0);
    const totalLiters = filteredRefills.reduce((sum, refill) => sum + refill.liters, 0);
    const totalDistance = filteredLogs.reduce((sum, log) => sum + log.distance, 0);
    
    const avgFuelPrice = totalLiters > 0 ? totalFuelCost / totalLiters : 0;
    const avgConsumption = totalLiters > 0 && totalDistance > 0 ? totalDistance / totalLiters : 0;
    const costPerKm = totalDistance > 0 ? totalFuelCost / totalDistance : 0;
    
    return {
      totalFuelCost,
      totalLiters,
      totalDistance,
      avgFuelPrice,
      avgConsumption,
      costPerKm,
      refillCount: filteredRefills.length
    };
  };

  const stats = calculateStats();

  // Sample chart data (simplified for this action)
  const consumptionData = [
    { name: "Jan", consumo: 10.5 },
    { name: "Fev", consumo: 11.2 },
    { name: "Mar", consumo: 10.8 },
    { name: "Abr", consumo: 12.1 },
    { name: "Mai", consumo: 11.7 },
    { name: "Jun", consumo: 10.9 }
  ];

  const costData = [
    { name: "Jan", valor: 450 },
    { name: "Fev", valor: 480 },
    { name: "Mar", valor: 520 },
    { name: "Abr", valor: 560 },
    { name: "Mai", valor: 590 },
    { name: "Jun", valor: 620 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Análise de Consumo de Combustível</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estatísticas de consumo e eficiência da frota
          </p>
        </div>
        
        <div className="flex gap-2">
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
          
          <select
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Consumo Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{stats.avgConsumption.toFixed(2)} km/L</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Baseado em {stats.refillCount} abastecimentos
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Custo por Km</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">R$ {stats.costPerKm.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total: {stats.totalDistance.toFixed(0)} km
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Litros Abastecidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{stats.totalLiters.toFixed(0)} L</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Preço médio: R$ {stats.avgFuelPrice.toFixed(2)}/L
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
                    <Fuel className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Gasto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">R$ {stats.totalFuelCost.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {period === "month" ? "Último mês" : period === "quarter" ? "Último trimestre" : "Último ano"}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-blue-600" />
                  Evolução do Consumo
                </CardTitle>
                <CardDescription>
                  Consumo médio (km/L) ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <CircleOff className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>Não há dados suficientes para gerar o gráfico</p>
                    <p className="text-sm mt-1">Registre mais abastecimentos para visualizar estatísticas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Gasto por Veículo
                </CardTitle>
                <CardDescription>
                  Comparação de gastos entre veículos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <CircleOff className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>Não há dados suficientes para gerar o gráfico</p>
                    <p className="text-sm mt-1">Registre mais abastecimentos para visualizar estatísticas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}