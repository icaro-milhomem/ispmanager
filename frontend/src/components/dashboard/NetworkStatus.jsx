import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WifiIcon, WifiOff, AlertTriangle, Activity } from "lucide-react";

export default function NetworkStatus() {
  // Em uma implementação real, esses dados viriam de uma API
  const networkData = {
    online: 85,
    offline: 7,
    warning: 8,
    totalBandwidth: 1000, // Mbps
    usedBandwidth: 650, // Mbps
    peakHours: [
      { hour: '20:00', usage: 850 },
      { hour: '21:00', usage: 920 },
      { hour: '22:00', usage: 780 },
    ]
  };

  const bandwidthPercentage = (networkData.usedBandwidth / networkData.totalBandwidth) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-blue-600" />
          Status da Rede
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-green-100 p-3 mb-2">
              <WifiIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="font-semibold text-xl">{networkData.online}%</div>
            <div className="text-sm text-gray-500">Online</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-red-100 p-3 mb-2">
              <WifiOff className="h-5 w-5 text-red-600" />
            </div>
            <div className="font-semibold text-xl">{networkData.offline}%</div>
            <div className="text-sm text-gray-500">Offline</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-yellow-100 p-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="font-semibold text-xl">{networkData.warning}%</div>
            <div className="text-sm text-gray-500">Alertas</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Consumo de Banda</span>
            <span className="text-sm font-medium">{networkData.usedBandwidth} / {networkData.totalBandwidth} Mbps</span>
          </div>
          <Progress 
            value={bandwidthPercentage} 
            className={`h-2 ${bandwidthPercentage > 90 ? 'bg-red-200' : bandwidthPercentage > 70 ? 'bg-yellow-200' : 'bg-gray-200'}`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Horários de Pico</span>
            <span className="text-sm text-gray-500">Uso (Mbps)</span>
          </div>
          {networkData.peakHours.map((peak, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{peak.hour}</span>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 h-2 rounded-full" style={{ width: `${(peak.usage / networkData.totalBandwidth) * 100}px` }}></div>
                <span className="text-sm">{peak.usage}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}