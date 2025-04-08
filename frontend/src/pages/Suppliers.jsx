import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "@/api/entities";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  FileText,
} from "lucide-react";
import SupplierForm from "../components/suppliers/SupplierForm";

export default function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await Supplier.list();
      setSuppliers(data);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os fornecedores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (window.confirm(`Deseja realmente excluir o fornecedor ${supplier.name}?`)) {
      try {
        await Supplier.delete(supplier.id);
        toast({
          title: "Fornecedor excluído",
          description: "O fornecedor foi excluído com sucesso"
        });
        loadSuppliers();
      } catch (error) {
        console.error("Erro ao excluir fornecedor:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o fornecedor",
          variant: "destructive"
        });
      }
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.document_number.includes(searchTerm) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryLabels = {
    fuel: "Combustível",
    energy: "Energia",
    internet: "Internet",
    maintenance: "Manutenção",
    supplies: "Suprimentos",
    others: "Outros"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <Button onClick={() => {
          setSelectedSupplier(null);
          setShowForm(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      {showForm && (
        <SupplierForm
          supplier={selectedSupplier}
          onSubmit={() => {
            setShowForm(false);
            setSelectedSupplier(null);
            loadSuppliers();
          }}
          onCancel={() => {
            setShowForm(false);
            setSelectedSupplier(null);
          }}
        />
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar fornecedores..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-gray-500">{supplier.document_number}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {categoryLabels[supplier.category] || supplier.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-1 text-gray-500" />
                      {supplier.phone}
                    </div>
                    {supplier.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-1 text-gray-500" />
                        {supplier.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                    {supplier.city}/{supplier.state}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={supplier.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {supplier.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDelete(supplier)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}