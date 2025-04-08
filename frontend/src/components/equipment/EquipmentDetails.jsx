import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  WifiOff,
  Calendar,
  MapPin,
  Edit,
  Clipboard,
  Router,
  Radio,
  Server,
  Layers,
  Monitor,
  Settings,
  User
} from "lucide-react";

const statusColors = {
  online: "bg-green-100 text-green-800",
  offline: "bg-red-100 text-red-800",
  manutenção: "bg-yellow-100 text-yellow-800",
  reserva: "bg-gray-100 text-gray-800",
};

const typeIcons = {
  router: Router,
  switch: Layers,
  ont: Wifi,
  olt: Server,
  radio: Radio,
  servidor: Monitor,
  outro: Settings
};

export default function EquipmentDetails({ equipment, customerName, onEdit, onClose }) {
  const TypeIcon = typeIcons[equipment.type] || Settings;
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TypeIcon className="w-5 h-5 text-blue-600" />
            {equipment.name}
          </CardTitle>
          <Badge
            variant="secondary"
            className={statusColors[equipment.status]}
          >
            <span className="flex items-center gap-1">
              {equipment.status === "online" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {equipment.status}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-sm text-gray-500">Tipo</p>
            <p className="font-medium capitalize">{equipment.type}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Modelo</p>
            <p className="font-medium">{equipment.model || "Não especificado"}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Endereço IP</p>
            <div className="flex items-center gap-2 font-medium">
              {equipment.ip_address}
              <button
                onClick={() => navigator.clipboard.writeText(equipment.ip_address)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Endereço MAC</p>
            <p className="font-medium">{equipment.mac_address || "Não especificado"}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Cliente</p>
            <div className="flex items-center gap-1 font-medium">
              <User className="w-4 h-4 text-gray-400" />
              {customerName || "Nenhum cliente associado"}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Localização</p>
            <div className="flex items-center gap-1 font-medium">
              <MapPin className="w-4 h-4 text-gray-400" />
              {equipment.location || "Não especificado"}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Data de Instalação</p>
            <div className="flex items-center gap-1 font-medium">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(equipment.installation_date).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
        
        {equipment.notes && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-1">Observações</p>
            <div className="p-3 bg-gray-50 rounded-md">
              {equipment.notes}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button type="button" className="bg-blue-600" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
}