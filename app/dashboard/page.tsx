'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown } from "lucide-react";
import { feelings } from "@/lib/feelings";
import { needs } from "@/lib/needs";

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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleFeeling = (feeling: string) => {
    if (selectedFeelings.includes(feeling)) {
      onChange(selectedFeelings.filter((f) => f !== feeling));
    } else {
      onChange([...selectedFeelings, feeling]);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sentimientos</h2>
      <p className="text-gray-600 mb-4">
        ¿Qué emociones o sentimientos son estimulados en ti? Reconoce y nombra
        cómo te sientes, sin juzgarte.
      </p>

      {Object.entries(feelings).map(([mainCategory, categories]) => (
        <div key={mainCategory} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{mainCategory}</h3>
          {Object.entries(categories as Record<string, string[]>).map(([category, feelingsList]) => (
            <div key={category} className="feeling-category">
              <h4 className="text-lg font-medium mb-3">{category}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {feelingsList.map((feeling) => (
                  <div
                    key={feeling}
                    className={`cursor-pointer px-4 py-2 rounded-full text-center text-sm font-medium transition-all duration-200 ease-in-out transform ${
    selectedFeelings.includes(feeling)
      ? "bg-blue-100 text-blue-800 shadow-md border border-blue-400 scale-105"
      : "bg-white text-gray-700 shadow-sm hover:shadow-md hover:scale-105 border border-gray-300"
 
                    }`}
                    onClick={() => toggleFeeling(feeling)}
                  >
                    
                    <span className="ml-2">{feeling}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleNeed = (need: string) => {
    if (selectedNeeds.includes(need)) {
      onChange(selectedNeeds.filter((n) => n !== need));
    } else {
      onChange([...selectedNeeds, need]);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Necesidades</h2>
      <p className="text-gray-600 mb-4">
        ¿Qué necesidades activan estos sentimientos? Conecta con la necesidad
        profunda que hay detrás de tu emoción.
      </p>

      {needs.map((category) => (
        <div key={category.category} className="feeling-category">
          <h3 className="text-xl font-semibold mb-4">{category.category}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.items.map((need) => (
              <div
                key={need}
               className={`cursor-pointer px-4 py-2 rounded-full text-center text-sm font-medium transition-all duration-200 ease-in-out transform ${
      selectedNeeds.includes(need)
        ? "bg-green-100 text-green-800 shadow-md border border-green-400 scale-105"
        : "bg-white text-gray-700 shadow-sm hover:shadow-md hover:scale-105 border border-gray-300"
  
                }`}
                onClick={() => toggleNeed(need)}
              >
                
                <span className="ml-2">{need}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
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
        ¿Qué acciones específicas quisiera que se realizaran ahora? Identifica qué
        podrías pedirte a ti mismo o a otros para cuidar de tu necesidad.
      </p>

      <div className="mb-4">
        <Textarea
          value={newRequest}
          onChange={(e) => setNewRequest(e.target.value)}
          placeholder="Escribe una petición concreta y realizable..."
          className="mb-2"
        />
        <Button onClick={addRequest}>Agregar Petición</Button>
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
  const handleWhatsAppShare = () => {
    const text = `
*Mi Conexión Interna - Resumen*

*OBSERVACIÓN:*
${formData.observation}

*SENTIMIENTOS:*
${formData.feelings.join(", ")}

*NECESIDADES:*
${formData.needs.join(", ")}

*PETICIONES:*
${formData.requests.join("\n")}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Resumen</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Observación</h3>
          <p className="bg-gray-50 p-4 rounded">{formData.observation}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Sentimientos</h3>
          <div className="flex flex-wrap gap-2">
            {formData.feelings.map((feeling: string) => (
              <span key={feeling} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {feeling}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Necesidades</h3>
          <div className="flex flex-wrap gap-2">
            {formData.needs.map((need: string) => (
              <span key={need} className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {need}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Peticiones</h3>
          <ul className="space-y-2">
            {formData.requests.map((request: string, index: number) => (
              <li key={index} className="bg-gray-50 p-3 rounded">
                {request}
              </li>
            ))}
          </ul>
        </div>

        <Button 
          onClick={handleWhatsAppShare} 
          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
            className="w-5 h-5"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.828z"/>
          </svg>
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