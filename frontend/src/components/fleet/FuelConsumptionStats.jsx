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
import { useToast } from "@/components/ui/use-toast";

export default function FuelConsumptionStats() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [refills, setRefills] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [mileageLogs, setMileageLogs] = useState([]);
  const [period, setPeriod] = useState("month");
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [dataSource, setDataSource] = useState("api"); // 'api' ou 'local'
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Função auxiliar para garantir que o resultado seja sempre um array
  const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && data.length) return Array.from(data);
    if (data && typeof data === 'object' && data.refills) return data.refills;
    if (data && typeof data === 'object') return Object.values(data).filter(item => item && typeof item === 'object');
    return [];
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setDataSource("api");
    
    try {
      console.log("Carregando dados reais de abastecimentos da API...");
      
      // Carregar dados de abastecimentos
      let refillsData;
      try {
        refillsData = await FuelRefill.list();
        console.log("Resposta da API - Abastecimentos:", refillsData);
      } catch (refillError) {
        console.error("Erro ao carregar abastecimentos:", refillError);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados de abastecimentos",
          variant: "destructive"
        });
        throw refillError;
      }
      
      // Carregar dados de veículos
      let vehiclesData;
      try {
        vehiclesData = await Vehicle.list();
        console.log("Resposta da API - Veículos:", vehiclesData);
      } catch (vehicleError) {
        console.error("Erro ao carregar veículos:", vehicleError);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados de veículos",
          variant: "destructive"
        });
        throw vehicleError;
      }
      
      // Carregar dados de quilometragem
      let mileageLogsData;
      try {
        mileageLogsData = await MileageLog.list();
        console.log("Resposta da API - Quilometragem:", mileageLogsData);
      } catch (mileageError) {
        console.error("Erro ao carregar logs de quilometragem:", mileageError);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados de quilometragem",
          variant: "destructive"
        });
        throw mileageError;
      }
      
      // Extrair arrays dos dados
      const refillsArray = ensureArray(refillsData);
      const vehiclesArray = ensureArray(vehiclesData);
      const mileageLogsArray = ensureArray(mileageLogsData);
      
      console.log("Arrays processados:");
      console.log("- Abastecimentos:", refillsArray.length, refillsArray);
      console.log("- Veículos:", vehiclesArray.length, vehiclesArray);
      console.log("- Quilometragem:", mileageLogsArray.length, mileageLogsArray);
      
      if (refillsArray.length === 0 && vehiclesArray.length === 0) {
        console.warn("Nenhum dado encontrado na API. Verificando se há problema com a conexão.");
        setDataSource("local");
        toast({
          title: "Aviso",
          description: "Não foi possível carregar dados do servidor. Usando dados locais para demonstração.",
          variant: "warning"
        });
      }
      
      // Normalizar os dados para garantir nomes de campos consistentes
      const normalizedRefills = refillsArray.map(refill => ({
        id: refill.id || `temp-${Math.random()}`,
        vehicle_id: refill.vehicle_id,
        date: refill.date,
        liters: refill.liters || refill.amount_liters || 0,
        total_cost: refill.total_cost || refill.total_price || 0,
        odometer: refill.odometer || refill.mileage || 0,
        fuel_type: refill.fuel_type || "Gasolina",
        createdAt: refill.createdAt || new Date().toISOString()
      }));
      
      console.log("Refills normalizados:", normalizedRefills);
      
      setRefills(normalizedRefills);
      setVehicles(vehiclesArray);
      setMileageLogs(mileageLogsArray);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError(error.message || "Erro desconhecido ao carregar dados");
      setDataSource("local");
      toast({
        title: "Erro",
        description: "Falha ao carregar dados. Usando dados locais para demonstração.",
        variant: "destructive"
      });
      
      // Carregar dados de demonstração em caso de erro
      const demoData = generateDemoData();
      setRefills(demoData.refills);
      setVehicles(demoData.vehicles);
      setMileageLogs(demoData.mileageLogs);
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar dados de demonstração para casos onde a API falha
  const generateDemoData = () => {
    console.log("Gerando dados de demonstração para visualização");
    
    const demoVehicles = [
      { id: "v1", plate: "ABC1234", model: "Fiat Strada", brand: "Fiat", fuel_type: "Gasolina" },
      { id: "v2", plate: "DEF5678", model: "VW Saveiro", brand: "Volkswagen", fuel_type: "Diesel" }
    ];
    
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const demoRefills = [];
    
    // Gerar 10 abastecimentos aleatórios no último mês
    for (let i = 0; i < 10; i++) {
      const vehicle = demoVehicles[Math.floor(Math.random() * demoVehicles.length)];
      const date = new Date(lastMonth.getTime() + Math.random() * (today.getTime() - lastMonth.getTime()));
      
      demoRefills.push({
        id: `demo-${i}`,
        vehicle_id: vehicle.id,
        date: date.toISOString(),
        liters: Math.floor(Math.random() * 30) + 20, // 20-50 litros
        total_cost: Math.floor(Math.random() * 150) + 100, // R$100-250
        odometer: Math.floor(Math.random() * 5000) + 10000, // 10000-15000 km
        fuel_type: vehicle.fuel_type
      });
    }
    
    const demoMileageLogs = [];
    
    // Gerar 5 registros de quilometragem
    for (let i = 0; i < 5; i++) {
      const vehicle = demoVehicles[Math.floor(Math.random() * demoVehicles.length)];
      const date = new Date(lastMonth.getTime() + Math.random() * (today.getTime() - lastMonth.getTime()));
      
      demoMileageLogs.push({
        id: `demo-log-${i}`,
        vehicle_id: vehicle.id,
        date: date.toISOString(),
        initial_mileage: Math.floor(Math.random() * 1000) + 10000,
        final_mileage: Math.floor(Math.random() * 1000) + 11000,
        distance: Math.floor(Math.random() * 500) + 100
      });
    }
    
    return {
      refills: demoRefills,
      vehicles: demoVehicles,
      mileageLogs: demoMileageLogs
    };
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

    console.log("Filtrando dados para o período:", period, "a partir de:", startDate);
    console.log("Veículo selecionado:", selectedVehicle);

    // Filter refills by date and vehicle if specified
    const filteredRefills = refills.filter(refill => {
      if (!refill || !refill.date) return false;
      const refillDate = new Date(refill.date);
      const matchesDate = refillDate >= startDate;
      const matchesVehicle = selectedVehicle === "all" || refill.vehicle_id === selectedVehicle;
      return matchesDate && matchesVehicle;
    });

    // Filter mileage logs by date and vehicle if specified
    const filteredLogs = mileageLogs.filter(log => {
      if (!log || !log.date) return false;
      const logDate = new Date(log.date);
      const matchesDate = logDate >= startDate;
      const matchesVehicle = selectedVehicle === "all" || log.vehicle_id === selectedVehicle;
      return matchesDate && matchesVehicle;
    });

    console.log("Abastecimentos filtrados:", filteredRefills.length);
    console.log("Registros de quilometragem filtrados:", filteredLogs.length);

    return {
      refills: filteredRefills,
      logs: filteredLogs
    };
  };

  // Função para formatar valores numéricos com segurança
  const formatNumber = (value, decimals = 2) => {
    if (value === undefined || value === null) return '0.00';
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  // Calculate statistics
  const calculateStats = () => {
    const { refills: filteredRefills, logs: filteredLogs } = getFilteredData();
    
    const totalFuelCost = filteredRefills.reduce((sum, refill) => sum + (refill?.total_cost || 0), 0);
    const totalLiters = filteredRefills.reduce((sum, refill) => sum + (refill?.liters || 0), 0);
    const totalDistance = filteredLogs.reduce((sum, log) => sum + (log?.distance || 0), 0);
    
    const avgFuelPrice = totalLiters > 0 ? totalFuelCost / totalLiters : 0;
    const avgConsumption = totalLiters > 0 && totalDistance > 0 ? totalDistance / totalLiters : 0;
    const costPerKm = totalDistance > 0 ? totalFuelCost / totalDistance : 0;
    
    const stats = {
      totalFuelCost,
      totalLiters,
      totalDistance,
      avgFuelPrice,
      avgConsumption,
      costPerKm,
      refillCount: filteredRefills.length
    };
    
    console.log("Estatísticas calculadas:", stats);
    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Análise de Consumo de Combustível</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estatísticas de consumo e eficiência da frota
            {dataSource === "local" && (
              <span className="ml-2 text-orange-500 font-medium">
                (Dados de demonstração)
              </span>
            )}
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
          
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Atualizar
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <p className="text-red-600 font-medium">Erro ao carregar dados</p>
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={loadData}
            className="mt-2 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
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
                    <p className="text-2xl font-bold">{formatNumber(stats.avgConsumption)} km/L</p>
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
                    <p className="text-2xl font-bold">R$ {formatNumber(stats.costPerKm)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total: {formatNumber(stats.totalDistance, 0)} km
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
                    <p className="text-2xl font-bold">{formatNumber(stats.totalLiters, 0)} L</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Preço médio: R$ {formatNumber(stats.avgFuelPrice)}/L
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
                    <p className="text-2xl font-bold">R$ {formatNumber(stats.totalFuelCost)}</p>
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