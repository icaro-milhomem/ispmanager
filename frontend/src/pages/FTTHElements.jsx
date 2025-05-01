import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CTOForm from '@/components/ftth/CTOForm';
import CTOViewer from '@/components/ftth/CTOViewer';
import { createEntityClient } from '@/api/apiClient';

export default function FTTHElements() {
  const [ctos, setCTOs] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const ctoClient = createEntityClient('ctos');

  useEffect(() => {
    loadCTOs();
  }, []);

  const loadCTOs = async () => {
    try {
      const data = await ctoClient.list();
      setCTOs(data);
    } catch (error) {
      console.error('Erro ao carregar CTOs:', error);
      alert('Erro ao carregar CTOs. Por favor, tente novamente.');
    }
  };

  const handleAddCTO = async (ctoData) => {
    try {
      const newCTO = await ctoClient.create(ctoData);
      setCTOs([...ctos, newCTO]);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao criar CTO:', error);
      alert('Erro ao criar CTO. Por favor, tente novamente.');
    }
  };

  const handleUpdateCTO = async (ctoData) => {
    try {
      const updatedCTO = await ctoClient.update(ctoData.id, ctoData);
      setCTOs(ctos.map(cto => cto.id === ctoData.id ? updatedCTO : cto));
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao atualizar CTO:', error);
      alert('Erro ao atualizar CTO. Por favor, tente novamente.');
    }
  };

  const handleDeleteCTO = async (ctoId) => {
    if (window.confirm("Tem certeza que deseja excluir esta CTO?")) {
      try {
        await ctoClient.delete(ctoId);
        setCTOs(ctos.filter(cto => cto.id !== ctoId));
        setSelectedElement(null);
        setShowForm(false);
      } catch (error) {
        console.error('Erro ao excluir CTO:', error);
        alert('Erro ao excluir CTO. Por favor, tente novamente.');
      }
    }
  };

  const filteredCTOs = ctos.filter(cto =>
    cto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cto.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Elementos da Rede FTTH</h1>
        <Button 
          onClick={() => {
            setSelectedElement(null);
            setShowForm(true);
          }}
          className="bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova CTO
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedElement ? "Editar CTO" : "Nova CTO"}</CardTitle>
          </CardHeader>
          <CardContent>
            <CTOForm
              cto={selectedElement}
              onSubmit={selectedElement ? handleUpdateCTO : handleAddCTO}
              onCancel={() => setShowForm(false)}
              onDelete={selectedElement ? () => handleDeleteCTO(selectedElement.id) : null}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>CTOs Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar CTOs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCTOs.map(cto => (
                  <Card
                    key={cto.id}
                    className="cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => setSelectedElement(cto)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium">{cto.name}</h3>
                      <p className="text-sm text-gray-500">{cto.address}</p>
                      <div className="mt-2 text-sm">
                        <span className="text-blue-600">{cto.ports?.length || 0}</span>
                        <span className="text-gray-500"> / </span>
                        <span className="text-gray-600">{cto.capacity || 16} portas</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedElement && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da CTO</CardTitle>
              </CardHeader>
              <CardContent>
                <CTOViewer
                  selectedCTO={selectedElement}
                  onCTOEdit={() => setShowForm(true)}
                  onCTOSelect={setSelectedElement}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 