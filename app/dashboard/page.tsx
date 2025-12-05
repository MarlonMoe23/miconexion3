'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, Search, X, Download, Share2 } from "lucide-react";
import { feelings } from "@/lib/feelings";
import { needs } from "@/lib/needs";
import html2canvas from "html2canvas";

const steps = ["Observación", "Sentimientos", "Necesidades", "Petición", "Resumen"];

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToBottom}
      className="fixed bottom-4 right-4 rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center z-50"
      size="icon"
    >
      <ChevronDown className="h-6 w-6" />
    </Button>
  );
}

function ObservationStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Observación</h2>
      <p className="text-gray-600 mb-4">
        ¿Qué acontecimiento desencadena tu vivencia? Identifica de manera objetiva
        qué viste, escuchaste o recordaste que activó tu reacción.
      </p>
      <Textarea
        placeholder="Ejemplo: Cuando veo que mi amiga no responde a mi mensaje..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[150px]"
      />
    </Card>
  );
}

function FeelingsStep({
  selectedFeelings,
  onChange,
}: {
  selectedFeelings: string[];
  onChange: (feelings: string[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFeelings, setFilteredFeelings] = useState(feelings);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFeelings(feelings);
      return;
    }

    const filtered: typeof feelings = {};
    const searchLower = searchTerm.toLowerCase();

    Object.entries(feelings).forEach(([mainCategory, categories]) => {
      const filteredCategories: Record<string, string[]> = {};
      
      Object.entries(categories as Record<string, string[]>).forEach(([category, feelingsList]) => {
        const matchingFeelings = feelingsList.filter(feeling =>
          feeling.toLowerCase().includes(searchLower)
        );
        
        if (matchingFeelings.length > 0) {
          filteredCategories[category] = matchingFeelings;
        }
      });

      if (Object.keys(filteredCategories).length > 0) {
        filtered[mainCategory] = filteredCategories;
      }
    });

    setFilteredFeelings(filtered);
  }, [searchTerm]);

  const toggleFeeling = (feeling: string) => {
    if (selectedFeelings.includes(feeling)) {
      onChange(selectedFeelings.filter((f) => f !== feeling));
    } else {
      onChange([...selectedFeelings, feeling]);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const totalFilteredFeelings = Object.values(filteredFeelings).reduce((total, categories) => {
    return total + Object.values(categories as Record<string, string[]>).reduce((catTotal, feelingsList) => {
      return catTotal + feelingsList.length;
    }, 0);
  }, 0);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sentimientos</h2>
      <p className="text-gray-600 mb-6">
        ¿Qué emociones o sentimientos son estimulados en ti? Reconoce y nombra
        cómo te sientes, sin juzgarte.
      </p>

      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar sentimientos... (ej: tristeza, alegría, frustración)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-3 text-base"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            {totalFilteredFeelings > 0 
              ? `${totalFilteredFeelings} sentimiento${totalFilteredFeelings !== 1 ? 's' : ''} encontrado${totalFilteredFeelings !== 1 ? 's' : ''}`
              : 'No se encontraron sentimientos'
            }
          </div>
        )}
      </div>

      {selectedFeelings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Sentimientos seleccionados ({selectedFeelings.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedFeelings.map((feeling) => (
              <span
                key={feeling}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors"
                onClick={() => toggleFeeling(feeling)}
              >
                {feeling} ×
              </span>
            ))}
          </div>
        </div>
      )}

      {Object.keys(filteredFeelings).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            No se encontraron sentimientos que coincidan con "{searchTerm}"
          </div>
          <div className="text-gray-400 text-sm">
            Intenta con otros términos o explora las categorías disponibles
          </div>
        </div>
      ) : (
        Object.entries(filteredFeelings).map(([mainCategory, categories]) => (
          <div key={mainCategory} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{mainCategory}</h3>
            {Object.entries(categories as Record<string, string[]>).map(([category, feelingsList]) => (
              <div key={category} className="feeling-category mb-6">
                <h4 className="text-lg font-medium mb-3 text-gray-700">{category}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {feelingsList.map((feeling) => (
                    <div
                      key={feeling}
                      className={`cursor-pointer px-4 py-2 rounded-full text-center text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 ${
                        selectedFeelings.includes(feeling)
                          ? "bg-blue-100 text-blue-800 shadow-md border border-blue-400 scale-105"
                          : "bg-white text-gray-700 shadow-sm hover:shadow-md border border-gray-300 hover:border-blue-300"
                      }`}
                      onClick={() => toggleFeeling(feeling)}
                    >
                      <span>{feeling}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      <ScrollToTopButton />
    </Card>
  );
}

function NeedsStep({
  selectedNeeds,
  onChange,
}: {
  selectedNeeds: string[];
  onChange: (needs: string[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNeeds, setFilteredNeeds] = useState(needs);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNeeds(needs);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = needs.map(category => ({
      ...category,
      items: category.items.filter(need =>
        need.toLowerCase().includes(searchLower)
      )
    })).filter(category => category.items.length > 0);

    setFilteredNeeds(filtered);
  }, [searchTerm]);

  const toggleNeed = (need: string) => {
    if (selectedNeeds.includes(need)) {
      onChange(selectedNeeds.filter((n) => n !== need));
    } else {
      onChange([...selectedNeeds, need]);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const totalFilteredNeeds = filteredNeeds.reduce((total, category) => {
    return total + category.items.length;
  }, 0);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Necesidades</h2>
      <p className="text-gray-600 mb-6">
        ¿Qué necesidades activan estos sentimientos? Conecta con la necesidad
        profunda que hay detrás de tu emoción.
      </p>

      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar necesidades... (ej: comprensión, autonomía, conexión)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-3 text-base"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            {totalFilteredNeeds > 0 
              ? `${totalFilteredNeeds} necesidad${totalFilteredNeeds !== 1 ? 'es' : ''} encontrada${totalFilteredNeeds !== 1 ? 's' : ''}`
              : 'No se encontraron necesidades'
            }
          </div>
        )}
      </div>

      {selectedNeeds.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Necesidades seleccionadas ({selectedNeeds.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedNeeds.map((need) => (
              <span
                key={need}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-green-200 transition-colors"
                onClick={() => toggleNeed(need)}
              >
                {need} ×
              </span>
            ))}
          </div>
        </div>
      )}

      {filteredNeeds.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            No se encontraron necesidades que coincidan con "{searchTerm}"
          </div>
          <div className="text-gray-400 text-sm">
            Intenta con otros términos o explora las categorías disponibles
          </div>
        </div>
      ) : (
        filteredNeeds.map((category) => (
          <div key={category.category} className="feeling-category mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{category.category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {category.items.map((need) => (
                <div
                  key={need}
                  className={`cursor-pointer px-4 py-2 rounded-full text-center text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 ${
                    selectedNeeds.includes(need)
                      ? "bg-green-100 text-green-800 shadow-md border border-green-400 scale-105"
                      : "bg-white text-gray-700 shadow-sm hover:shadow-md border border-gray-300 hover:border-green-300"
                  }`}
                  onClick={() => toggleNeed(need)}
                >
                  <span>{need}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <ScrollToTopButton />
    </Card>
  );
}

function RequestStep({
  requests,
  onChange,
}: {
  requests: string[];
  onChange: (requests: string[]) => void;
}) {
  const [newRequest, setNewRequest] = useState("");

  const addRequest = () => {
    if (newRequest.trim()) {
      onChange([...requests, newRequest.trim()]);
      setNewRequest("");
    }
  };

  const removeRequest = (index: number) => {
    onChange(requests.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Petición</h2>
      <p className="text-gray-600 mb-4">
        ¿Qué acciones o estrategias específicas quisiera que se realizaran ahora? Identifica qué
        podrías pedirte a ti mismo o a otros para cuidar de tu necesidad.
      </p>

      <div className="mb-4">
        <Textarea
          value={newRequest}
          onChange={(e) => setNewRequest(e.target.value)}
          placeholder="Escribe una petición o estrategia concreta y realizable..."
          className="mb-2"
        />
        <Button onClick={addRequest}>Agregar Petición o Estrategia</Button>
      </div>

      <div className="space-y-2">
        {requests.map((request, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span>{request}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRequest(index)}
              className="text-red-500"
            >
              Eliminar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SummaryStep({ formData }: { formData: any }) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleWhatsAppShare = () => {
    const text = `
*Mi Conexión Interna - Resumen*

*OBSERVACIÓN:*
${formData.observation}

*SENTIMIENTOS:*
${formData.feelings.join(", ")}

*NECESIDADES:*
${formData.needs.join(", ")}

*PETICIONES/ESTRATEGIAS:*
${formData.requests.join("\n")}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadImage = async () => {
    if (!summaryRef.current) return;

    setIsGenerating(true);
    
    try {
      // Generar la imagen
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Mayor calidad
        logging: false,
        useCORS: true,
      });

      // Convertir a blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast({
            title: "Error",
            description: "No se pudo generar la imagen",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        // Crear enlace de descarga
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const now = new Date();
        const dateTime = now.toLocaleDateString('es-ES').replace(/\//g, '-') + '-' + now.toLocaleTimeString('es-ES').replace(/:/g, '-');
        link.download = `mi-conexion-interna-${dateTime}.png`;
        link.href = url;
        link.click();
        
        // Limpiar
        URL.revokeObjectURL(url);
        
        toast({
          title: "¡Imagen guardada!",
          description: "La imagen se descargó correctamente. Busca en tu carpeta de Descargas.",
        });
        
        setIsGenerating(false);
      }, 'image/png');

    } catch (error) {
      console.error('Error al generar imagen:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar la imagen",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
     {/* Contenido que se convertirá en imagen */}
      <div 
        ref={summaryRef} 
        className="bg-white p-6 rounded-lg"
      >
        {/* Header decorativo */}
        <div className="text-center mb-6 pb-4 border-b-2 border-blue-500">
          <h1 className="text-2xl font-bold text-blue-600 mb-1">Mi Conexión Interna</h1>
          <p className="text-sm text-gray-600">Resumen de tu proceso CNV</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="space-y-4">
          {/* Observación */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Observación</h3>
            <p className="text-gray-700 text-sm leading-snug bg-gray-50 p-3 rounded">{formData.observation}</p>
          </div>

          {/* Sentimientos */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Sentimientos</h3>
            <div className="flex flex-wrap gap-1.5">
              {formData.feelings.map((feeling: string) => (
                <span key={feeling} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {feeling}
                </span>
              ))}
            </div>
          </div>

          {/* Necesidades */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Necesidades</h3>
            <div className="flex flex-wrap gap-1.5">
              {formData.needs.map((need: string) => (
                <span key={need} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {need}
                </span>
              ))}
            </div>
          </div>

          {/* Peticiones/Estrategias */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Peticiones</h3>
            <ul className="space-y-1.5">
              {formData.requests.map((request: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 text-sm bg-gray-50 p-2 rounded">
                  <span className="text-blue-500 font-bold">•</span>
                  <span className="flex-1">{request}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 text-center text-xs text-gray-500 border-t border-gray-300">
          <p>Comunicación No Violenta - Marshall Rosenberg</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-6 space-y-3">
        <Button 
          onClick={handleDownloadImage}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          {isGenerating ? 'Generando imagen...' : 'Descargar como Imagen'}
        </Button>

        <Button 
          onClick={handleWhatsAppShare} 
          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Compartir por WhatsApp
        </Button>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    observation: "",
    feelings: [] as string[],
    needs: [] as string[],
    requests: [] as string[],
  });
  
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === steps.length - 1) {
        setFormData({
          observation: "",
          feelings: [],
          needs: [],
          requests: [],
        });
        setCurrentStep(0);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.observation) {
          toast({
            title: "Error",
            description: "Por favor describe la situación",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 1:
        if (formData.feelings.length === 0) {
          toast({
            title: "Error",
            description: "Por favor selecciona al menos un sentimiento",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 2:
        if (formData.needs.length === 0) {
          toast({
            title: "Error",
            description: "Por favor selecciona al menos una necesidad",
            variant: "destructive",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ObservationStep
            value={formData.observation}
            onChange={(value) => setFormData({ ...formData, observation: value })}
          />
        );
      case 1:
        return (
          <FeelingsStep
            selectedFeelings={formData.feelings}
            onChange={(value) => setFormData({ ...formData, feelings: value })}
          />
        );
      case 2:
        return (
          <NeedsStep
            selectedNeeds={formData.needs}
            onChange={(value) => setFormData({ ...formData, needs: value })}
          />
        );
      case 3:
        return (
          <RequestStep
            requests={formData.requests}
            onChange={(value) => setFormData({ ...formData, requests: value })}
          />
        );
      case 4:
        return <SummaryStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`text-sm ${
                index === currentStep ? "text-blue-600 font-bold" : "text-gray-400"
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-4 mt-8">
          {currentStep > 0 && (
            <Button onClick={handleBack} variant="outline">
              Atrás
            </Button>
          )}
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
          </Button>
        </div>
      </div>
    </div>
  );
}