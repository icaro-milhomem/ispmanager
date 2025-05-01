import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Cable, Split } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  CABLE_TYPES, 
  FIBER_COLORS, 
  SPLITTER_TYPES, 
  SPLITTER_RATIOS 
} from '@/config/ftthConfig';
import { toast } from "react-hot-toast";
import '@/styles/components/FiberConnectionForm.css';

const FIBER_OPTIONS = [
  { value: 1, label: '1 FO' },
  { value: 2, label: '2 FO' },
  { value: 4, label: '4 FO' },
  { value: 6, label: '6 FO' },
  { value: 8, label: '8 FO' },
  { value: 12, label: '12 FO' },
  { value: 24, label: '24 FO' },
  { value: 36, label: '36 FO' }
];

const formatCoordinates = (coords) => {
  try {
    if (!coords) {
      console.log('Coordenadas não fornecidas');
      return [];
    }

    if (!Array.isArray(coords)) {
      console.log('Coordenadas inválidas: não é um array', coords);
      return [];
    }

    return coords.map((coord) => {
      // Se já for um array [lat, lng]
      if (Array.isArray(coord)) {
        const [lat, lng] = coord;
        if (typeof lat === 'number' && typeof lng === 'number') {
          return [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))];
        }
      }
      
      // Se for um objeto {lat, lng} do Leaflet
      if (coord && typeof coord === 'object') {
        const lat = coord.lat || coord.latitude;
        const lng = coord.lng || coord.longitude;
        
        if (typeof lat === 'number' && typeof lng === 'number') {
          return [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))];
        }
      }
      
      console.log('Coordenada inválida:', coord);
      return null;
    }).filter(Boolean);
  } catch (error) {
    console.error('Erro ao formatar coordenadas:', error);
    return [];
  }
};

const FiberConnectionForm = ({
  sourceElement,
  targetElement,
  onSave,
  onCancel,
  initialData = {}
}) => {
  const [formData, setFormData] = useState({
    type: initialData.type || 'backbone',
    fibers: initialData.fibers || 12,
    color: initialData.color || FIBER_COLORS[0]?.value || 'blue',
    hasSplitter: initialData.hasSplitter || false,
    splitterType: initialData.splitterType || '',
    splitterRatio: initialData.splitterRatio || '',
    splitterLocation: initialData.splitterLocation || '',
    notes: initialData.notes || '',
    coordinates: formatCoordinates(initialData.coordinates) || [],
    sourceId: initialData.sourceId || sourceElement?.id || null,
    targetId: initialData.targetId || targetElement?.id || null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  useEffect(() => {
    console.log('Formulário atualizado:', formData);
  }, [formData]);

  const validateField = (name, value) => {
    switch (name) {
      case 'type':
        return !value ? 'Tipo de cabo é obrigatório' : '';
      case 'fibers':
        return !value ? 'Número de fibras é obrigatório' : '';
      case 'color':
        return !value ? 'Cor é obrigatória' : '';
      case 'coordinates':
        return !value || !Array.isArray(value) || value.length < 2 ? 'São necessários pelo menos dois pontos' : '';
      case 'sourceId':
        return formData.type !== 'backbone' && !value ? 'Elemento de origem é obrigatório' : '';
      case 'targetId':
        return formData.type !== 'backbone' && !value ? 'Elemento de destino é obrigatório' : '';
      case 'splitterType':
        return formData.hasSplitter && !value ? 'Tipo do splitter é obrigatório' : '';
      case 'splitterRatio':
        return formData.hasSplitter && !value ? 'Razão do splitter é obrigatória' : '';
      case 'splitterLocation':
        return formData.hasSplitter && !value ? 'Localização do splitter é obrigatória' : '';
      default:
        return '';
    }
  };

  const handleFieldChange = (name, value) => {
    console.log('Campo alterado:', name, value);
    
    if (name === 'hasSplitter' && !value) {
      // Se desativar o splitter, limpar os campos relacionados
      setFormData(prev => ({
        ...prev,
        [name]: value,
        splitterType: '',
        splitterRatio: '',
        splitterLocation: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    const requiredFields = ['type', 'fibers', 'color'];
    if (formData.hasSplitter) {
      requiredFields.push('splitterType', 'splitterRatio', 'splitterLocation');
    }
    
    const hasErrors = requiredFields.some(field => validateField(field, formData[field]));
    console.log('Validação do formulário:', !hasErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Tentando enviar formulário:', formData);

    // Marcar todos os campos como tocados para mostrar erros
    const allFields = Object.keys(formData);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    if (!isFormValid()) {
      setFeedback({
        type: 'error',
        message: 'Por favor, preencha todos os campos obrigatórios'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        coordinates: formatCoordinates(formData.coordinates)
      };

      await onSave(dataToSave);
      setFeedback({
        type: 'success',
        message: 'Conexão salva com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setFeedback({
        type: 'error',
        message: error.message || 'Erro ao salvar a conexão'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="fiber-connection-form" onSubmit={handleSubmit}>
      {feedback.message && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {sourceElement && targetElement && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Origem</Label>
            <div className="text-sm font-medium">{sourceElement.name}</div>
          </div>
          <div>
            <Label>Destino</Label>
            <div className="text-sm font-medium">{targetElement.name}</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Tipo de Cabo</Label>
          <Select 
            defaultValue={formData.type}
            onValueChange={(value) => handleFieldChange('type', value)}
          >
            <SelectTrigger className={errors.type && touched.type ? 'error' : ''}>
              <SelectValue placeholder="Selecione o tipo de cabo" />
            </SelectTrigger>
            <SelectContent position="popper" className="select-content">
              <SelectItem value="backbone">Backbone</SelectItem>
              <SelectItem value="as80">AS80</SelectItem>
              <SelectItem value="as120">AS120</SelectItem>
              <SelectItem value="as200">AS200</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && touched.type && (
            <span className="error-message">{errors.type}</span>
          )}
        </div>

        <div>
          <Label>Quantidade de Fibras</Label>
          <Select 
            defaultValue={formData.fibers.toString()}
            onValueChange={(value) => handleFieldChange('fibers', parseInt(value))}
          >
            <SelectTrigger className={errors.fibers && touched.fibers ? 'error' : ''}>
              <SelectValue placeholder="Selecione a quantidade de fibras" />
            </SelectTrigger>
            <SelectContent position="popper" className="select-content">
              {FIBER_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fibers && touched.fibers && (
            <span className="error-message">{errors.fibers}</span>
          )}
        </div>

        <div>
          <Label>Cor do Cabo</Label>
          <Select 
            defaultValue={formData.color}
            onValueChange={(value) => handleFieldChange('color', value)}
          >
            <SelectTrigger className={errors.color && touched.color ? 'error' : ''}>
              <SelectValue placeholder="Selecione a cor do cabo" />
            </SelectTrigger>
            <SelectContent position="popper" className="select-content">
              {FIBER_COLORS.map(color => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ 
                        backgroundColor: color.hex,
                        border: color.value === 'branco' ? '1px solid #e5e7eb' : 'none'
                      }} 
                    />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.color && touched.color && (
            <span className="error-message">{errors.color}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="hasSplitter"
            checked={formData.hasSplitter}
            onCheckedChange={(checked) => handleFieldChange('hasSplitter', checked)}
          />
          <Label htmlFor="hasSplitter">Possui Splitter</Label>
        </div>

        {formData.hasSplitter && (
          <>
            <div>
              <Label>Tipo de Splitter</Label>
              <Select 
                value={formData.splitterType}
                onValueChange={(value) => handleFieldChange('splitterType', value)}
              >
                <SelectTrigger className={errors.splitterType && touched.splitterType ? 'error' : ''}>
                  <SelectValue placeholder="Selecione o tipo de splitter" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPLITTER_TYPES).map(([value, { name }]) => (
                    <SelectItem key={value} value={value}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.splitterType && touched.splitterType && (
                <span className="error-message">{errors.splitterType}</span>
              )}
            </div>

            <div>
              <Label>Razão do Splitter</Label>
              <Select 
                value={formData.splitterRatio}
                onValueChange={(value) => handleFieldChange('splitterRatio', value)}
              >
                <SelectTrigger className={errors.splitterRatio && touched.splitterRatio ? 'error' : ''}>
                  <SelectValue placeholder="Selecione a razão do splitter" />
                </SelectTrigger>
                <SelectContent>
                  {SPLITTER_RATIOS.map(ratio => (
                    <SelectItem key={ratio.value} value={ratio.value}>
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.splitterRatio && touched.splitterRatio && (
                <span className="error-message">{errors.splitterRatio}</span>
              )}
            </div>

            <div>
              <Label>Localização do Splitter</Label>
              <Select 
                value={formData.splitterLocation}
                onValueChange={(value) => handleFieldChange('splitterLocation', value)}
              >
                <SelectTrigger className={errors.splitterLocation && touched.splitterLocation ? 'error' : ''}>
                  <SelectValue placeholder="Selecione a localização do splitter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Início</SelectItem>
                  <SelectItem value="middle">Meio</SelectItem>
                  <SelectItem value="end">Fim</SelectItem>
                </SelectContent>
              </Select>
              {errors.splitterLocation && touched.splitterLocation && (
                <span className="error-message">{errors.splitterLocation}</span>
              )}
            </div>
          </>
        )}

        <div>
          <Label>Observações</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            onBlur={() => handleBlur('notes')}
            placeholder="Observações adicionais"
            rows={3}
          />
          {errors.notes && touched.notes && (
            <span className="error-message">{errors.notes}</span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className={isSubmitting ? 'loading' : ''}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default FiberConnectionForm;