import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import VehicleList from "../components/fleet/VehicleList";
import FuelRefillList from "../components/fleet/FuelRefillList";
import MileageLogList from "../components/fleet/MileageLogList";
import FuelConsumptionStats from "../components/fleet/FuelConsumptionStats";

export default function FleetFuelMonitoring() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Monitoramento de Consumo de Combustível</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Controle e análise de abastecimentos e quilometragem da frota
        </p>
      </div>

      <Tabs
        defaultValue="dashboard" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-white dark:bg-gray-800 border dark:border-gray-700">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="refills">Abastecimentos</TabsTrigger>
          <TabsTrigger value="mileage">Quilometragem</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <FuelConsumptionStats />
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <VehicleList />
        </TabsContent>

        <TabsContent value="refills" className="space-y-4">
          <FuelRefillList />
        </TabsContent>

        <TabsContent value="mileage" className="space-y-4">
          <MileageLogList />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Consumo</CardTitle>
              <CardDescription>
                Analise o consumo de combustível por veículo, período e motorista
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                Selecione os filtros desejados para gerar relatórios detalhados
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}