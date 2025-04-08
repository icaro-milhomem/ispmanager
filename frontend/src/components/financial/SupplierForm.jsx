import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Loader2
} from "lucide-react";
import { Supplier } from "@/api/entities";

export default function SupplierForm({ supplier, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    supplier || {
      name: "",
      company_id: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      website: "",
      payment_terms: "",
      shipping_terms: "",
      is_active: true,
      notes: ""
    }
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando o campo é alterado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome do fornecedor é obrigatório";
    }
    
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = "Telefone de contato é obrigatório";
    }
    
    if (formData.contact_email && !formData.contact_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.contact_email = "Email inválido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (supplier) {
        await Supplier.update(supplier.id, formData);
      } else {
        await Supplier.create(formData);
      }
      
      onSubmit();
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {supplier ? "Editar Fornecedor" : "Novo Fornecedor"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome da Empresa <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`pl-10 ${errors.name ? "border-red-300" : ""}`}
                  placeholder="Nome do fornecedor"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_id">CNPJ</Label>
              <Input
                id="company_id"
                value={formData.company_id}
                onChange={(e) => handleChange("company_id", e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_name">Nome do Contato</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleChange("contact_name", e.target.value)}
                  className="pl-10"
                  placeholder="Nome da pessoa de contato"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange("contact_email", e.target.value)}
                  className={`pl-10 ${errors.contact_email ? "border-red-300" : ""}`}
                  placeholder="email@exemplo.com"
                />
              </div>
              {errors.contact_email && (
                <p className="text-xs text-red-500">{errors.contact_email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone">
                Telefone <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange("contact_phone", e.target.value)}
                  className={`pl-10 ${errors.contact_phone ? "border-red-300" : ""}`}
                  placeholder="(00) 00000-0000"
                />
              </div>
              {errors.contact_phone && (
                <p className="text-xs text-red-500">{errors.contact_phone}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="pl-10"
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="pl-10 min-h-[80px]"
                  placeholder="Endereço completo"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Condições de Pagamento</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => handleChange("payment_terms", e.target.value)}
                placeholder="Ex: 30 dias, à vista"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shipping_terms">Condições de Frete</Label>
              <Input
                id="shipping_terms"
                value={formData.shipping_terms}
                onChange={(e) => handleChange("shipping_terms", e.target.value)}
                placeholder="Ex: CIF, FOB"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="min-h-[100px]"
                placeholder="Observações adicionais sobre o fornecedor"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Fornecedor ativo</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}