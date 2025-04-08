import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Map,
  Router,
  Clock,
  Edit,
  CheckCircle
} from "lucide-react";

export default function ClientAccountInfo({ clientData = {}, equipment = [] }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: clientData?.phone || "",
    address: clientData?.address || "",
    email: clientData?.email || ""
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui teríamos a chamada de API para atualizar os dados
    console.log("Dados atualizados:", formData);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setEditing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Minha Conta</h2>
        {!editing && (
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      {success && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Seus dados foram atualizados com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={clientData?.full_name || ""} 
                      disabled 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => handleChange("email", e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={(e) => handleChange("phone", e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input 
                      id="address" 
                      value={formData.address} 
                      onChange={(e) => handleChange("address", e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Nome Completo</div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{clientData?.full_name || "Não informado"}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formData.email || "Não informado"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Telefone</div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formData.phone || "Não informado"}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Endereço</div>
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formData.address || "Não informado"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Router className="w-5 h-5 text-blue-600" />
              Informações da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equipment.length > 0 ? (
                equipment.map((eq, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-medium">{eq.name || "Equipamento"}</div>
                      <Badge className={eq.status === "online" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {eq.status === "online" ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Modelo:</span>
                        <span>{eq.model || "Não informado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">IP:</span>
                        <span>{eq.ip_address || "Não informado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">MAC:</span>
                        <span>{eq.mac_address || "Não informado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Instalação:</span>
                        <span>{eq.installation_date ? new Date(eq.installation_date).toLocaleDateString('pt-BR') : "Não informado"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Router className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Nenhum equipamento cadastrado</p>
                </div>
              )}
              
              <div className="rounded-lg bg-gray-50 p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Tempo de Cliente</span>
                </div>
                <div className="text-center py-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {clientData?.created_date ? Math.floor((new Date() - new Date(clientData.created_date)) / (1000 * 60 * 60 * 24 * 30)) : 0} meses
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Cliente desde {clientData?.created_date ? new Date(clientData.created_date).toLocaleDateString('pt-BR') : "Não informado"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}