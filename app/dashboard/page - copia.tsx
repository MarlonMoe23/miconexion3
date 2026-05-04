'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, Search, X, Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";

// Importa ambas versiones de sentimientos y necesidades
import { feelings as feelingsHombres } from "@/lib/feelings-hombres";
import { feelings as feelingsMujeres } from "@/lib/feelings-mujeres";
import { needs as needsHombres } from "@/lib/needs-hombres";
import { needs as needsMujeres } from "@/lib/needs-mujeres";

const steps = ["Observación", "Sentimientos", "Necesidades", "Petición", "Resumen"];

// ─── Hook: leer género de localStorage ───────────────────────────────────────
function useGenderData() {
  const [gender, setGender] = useState<"hombre" | "mujer">("hombre");

  useEffect(() => {
    const saved = localStorage.getItem("cnv_gender");
    if (saved === "mujer") setGender("mujer");
  }, []);

  return {
    gender,
    feelings: gender === "mujer" ? feelingsMujeres : feelingsHombres,
    needs: gender === "mujer" ? needsMujeres : needsHombres,
  };
}

// ─── Botón de scroll ──────────────────────────────────────────────────────────
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setIsVisible(window.pageYOffset > 300);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  if (!isVisible) return null;

  return (
    <Button
      onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
      className="fixed bottom-4 right-4 rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center z-50"
      size="icon"
    >
      <ChevronDown className="h-6 w-6" />
    </Button>
  );
}

// ─── Paso 1: Observación ──────────────────────────────────────────────────────
function ObservationStep({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Observación</h2>
      <p className="text-gray-600 mb-4">
        ¿Qué acontecimiento desencadena tu vivencia? Identifica de manera objetiva
        qué viste, escuchaste o recordaste que activó tu reacción.
      </p>
      <Textarea
        placeholder="Ejemplo: Cuando veo que mi amigo no responde a mi mensaje..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[150px]"
      />
    </Card>
  );
}

// ─── Paso 2: Sentimientos ─────────────────────────────────────────────────────
function FeelingsStep({
  selectedFeelings,
  onChange,
  feelings,
}: {
  selectedFeelings: string[];
  onChange: (feelings: string[]) => void;
  feelings: typeof feelingsHombres;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFeelings, setFilteredFeelings] = useState(feelings);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  useEffect(() => {
    if (!searchTerm.trim()) { setFilteredFeelings(feelings); return; }
    const filtered: typeof feelings = {};
    const searchLower = searchTerm.toLowerCase();
    Object.entries(feelings).forEach(([mainCat, cats]) => {
      const filteredCats: Record<string, string[]> = {};
      Object.entries(cats as Record<string, string[]>).forEach(([cat, list]) => {
        const matching = list.filter(f => f.toLowerCase().includes(searchLower));
        if (matching.length > 0) filteredCats[cat] = matching;
      });
      if (Object.keys(filteredCats).length > 0) filtered[mainCat] = filteredCats;
    });
    setFilteredFeelings(filtered);
  }, [searchTerm, feelings]);

  const toggleFeeling = (feeling: string) => {
    onChange(selectedFeelings.includes(feeling)
      ? selectedFeelings.filter(f => f !== feeling)
      : [...selectedFeelings, feeling]);
  };

  const totalFiltered = Object.values(filteredFeelings).reduce((t, cats) =>
    t + Object.values(cats as Record<string, string[]>).reduce((s, l) => s + l.length, 0), 0);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sentimientos</h2>
      <p className="text-gray-600 mb-6">
        ¿Qué emociones o sentimientos son activados en ti? Reconoce y nombra
        cómo te sientes, sin juzgarte.
      </p>

      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar sentimientos... (ej: tristeza, alegría)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-3 text-base"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            {totalFiltered > 0
              ? `${totalFiltered} sentimiento${totalFiltered !== 1 ? 's' : ''} encontrado${totalFiltered !== 1 ? 's' : ''}`
              : 'No se encontraron sentimientos'}
          </div>
        )}
      </div>

      {selectedFeelings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Seleccionados ({selectedFeelings.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedFeelings.map(f => (
              <span key={f} onClick={() => toggleFeeling(f)}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors">
                {f} ×
              </span>
            ))}
          </div>
        </div>
      )}

      {Object.keys(filteredFeelings).length === 0 ? (
        <div className="text-center py-12 text-gray-500">No se encontraron resultados para "{searchTerm}"</div>
      ) : (
        Object.entries(filteredFeelings).map(([mainCat, cats]) => (
          <div key={mainCat} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{mainCat}</h3>
            {Object.entries(cats as Record<string, string[]>).map(([cat, list]) => (
              <div key={cat} className="feeling-category mb-6">
                <h4 className="text-lg font-medium mb-3 text-gray-700">{cat}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {list.map(feeling => (
                    <div key={feeling} onClick={() => toggleFeeling(feeling)}
                      className={`cursor-pointer px-4 py-2 rounded-full text-center text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                        selectedFeelings.includes(feeling)
                          ? "bg-blue-100 text-blue-800 shadow-md border border-blue-400 scale-105"
                          : "bg-white text-gray-700 shadow-sm hover:shadow-md border border-gray-300 hover:border-blue-300"
                      }`}>
                      {feeling}
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

// ─── Paso 3: Necesidades ──────────────────────────────────────────────────────
function NeedsStep({
  selectedNeeds,
  onChange,
  needs,
}: {
  selectedNeeds: string[];
  onChange: (needs: string[]) => void;
  needs: typeof needsHombres;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNeeds, setFilteredNeeds] = useState(needs);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  useEffect(() => {
    if (!searchTerm.trim()) { setFilteredNeeds(needs); return; }
    const searchLower = searchTerm.toLowerCase();
    setFilteredNeeds(needs.map(cat => ({
      ...cat,
      items: cat.items.filter(n => n.toLowerCase().includes(searchLower))
    })).filter(cat => cat.items.length > 0));
  }, [searchTerm, needs]);

  const toggleNeed = (need: string) => {
    onChange(selectedNeeds.includes(need)
      ? selectedNeeds.filter(n => n !== need)
      : [...selectedNeeds, need]);
  };

  const totalFiltered = filteredNeeds.reduce((t, cat) => t + cat.items.length, 0);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Necesidades</h2>
      <p className="text-gray-600 mb-6">
        ¿Qué necesidades activan estos sentimientos? Conecta con la necesidad
        profunda que hay detrás de tu emoción.
      </p>

      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar necesidades... (ej: comprensión, autonomía)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-3 text-base"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            {totalFiltered > 0
              ? `${totalFiltered} necesidad${totalFiltered !== 1 ? 'es' : ''} encontrada${totalFiltered !== 1 ? 's' : ''}`
              : 'No se encontraron necesidades'}
          </div>
        )}
      </div>

      {selectedNeeds.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Seleccionadas ({selectedNeeds.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedNeeds.map(n => (
              <span key={n} onClick={() => toggleNeed(n)}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-green-200 transition-colors">
                {n} ×
              </span>
            ))}
          </div>
        </div>
      )}

      {filteredNeeds.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No se encontraron resultados para "{searchTerm}"</div>
      ) : (
        filteredNeeds.map(cat => (
          <div key={cat.category} className="feeling-category mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{cat.category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {cat.items.map(need => (
                <div key={need} onClick={() => toggleNeed(need)}
                  className={`cursor-pointer px-4 py-2 rounded-full text-center text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    selectedNeeds.includes(need)
                      ? "bg-green-100 text-green-800 shadow-md border border-green-400 scale-105"
                      : "bg-white text-gray-700 shadow-sm hover:shadow-md border border-gray-300 hover:border-green-300"
                  }`}>
                  {need}
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

// ─── Paso 4: Petición ─────────────────────────────────────────────────────────
function RequestStep({ requests, onChange }: { requests: string[]; onChange: (r: string[]) => void }) {
  const [newRequest, setNewRequest] = useState("");
  const addRequest = () => {
    if (newRequest.trim()) { onChange([...requests, newRequest.trim()]); setNewRequest(""); }
  };
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Petición</h2>
      <p className="text-gray-600 mb-4">
        ¿Qué acciones o estrategias específicas quisiera que se realizaran ahora?
        Identifica qué podrías pedirte a ti mismo o a otros para cuidar de tu necesidad.
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
        {requests.map((r, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span>{r}</span>
            <Button variant="ghost" size="sm" onClick={() => onChange(requests.filter((_, j) => j !== i))} className="text-red-500">
              Eliminar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Paso 5: Resumen ──────────────────────────────────────────────────────────
function SummaryStep({ formData }: { formData: any }) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleWhatsAppShare = () => {
    const text = `*Mi Conexión Interna - Resumen*\n\n*OBSERVACIÓN:*\n${formData.observation}\n\n*SENTIMIENTOS:*\n${formData.feelings.join(", ")}\n\n*NECESIDADES:*\n${formData.needs.join(", ")}\n\n*PETICIONES/ESTRATEGIAS:*\n${formData.requests.join("\n")}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadImage = async () => {
    if (!summaryRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(summaryRef.current, { backgroundColor: '#ffffff', scale: 2, logging: false, useCORS: true });
      canvas.toBlob((blob) => {
        if (!blob) { toast({ title: "Error", description: "No se pudo generar la imagen", variant: "destructive" }); setIsGenerating(false); return; }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const now = new Date();
        link.download = `mi-conexion-interna-${now.toLocaleDateString('es-ES').replace(/\//g, '-')}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: "¡Imagen guardada!", description: "La imagen se descargó correctamente." });
        setIsGenerating(false);
      }, 'image/png');
    } catch {
      toast({ title: "Error", description: "Hubo un problema al generar la imagen", variant: "destructive" });
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <div ref={summaryRef} className="bg-white p-6 rounded-lg">
        <div className="text-center mb-6 pb-4 border-b-2 border-blue-500">
          <h1 className="text-2xl font-bold text-blue-600 mb-1">Mi Conexión Interna</h1>
          <p className="text-sm text-gray-600">Resumen de tu proceso CNV</p>
          <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Observación</h3>
            <p className="text-gray-700 text-sm leading-snug bg-gray-50 p-3 rounded">{formData.observation}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Sentimientos</h3>
            <div className="flex flex-wrap gap-1.5">
              {formData.feelings.map((f: string) => <span key={f} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{f}</span>)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Necesidades</h3>
            <div className="flex flex-wrap gap-1.5">
              {formData.needs.map((n: string) => <span key={n} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{n}</span>)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Peticiones/Estrategias</h3>
            <ul className="space-y-1.5">
              {formData.requests.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 text-sm bg-gray-50 p-2 rounded">
                  <span className="text-blue-500 font-bold">•</span><span className="flex-1">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-3 text-center text-xs text-gray-500 border-t border-gray-300">
          <p>Comunicación No Violenta - Marshall Rosenberg</p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <Button onClick={handleDownloadImage} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />{isGenerating ? 'Generando imagen...' : 'Descargar como Imagen'}
        </Button>
        <Button onClick={handleWhatsAppShare} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" />Compartir por WhatsApp
        </Button>
      </div>
    </Card>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ observation: "", feelings: [] as string[], needs: [] as string[], requests: [] as string[] });
  const { toast } = useToast();

  // Lee el género y selecciona los datos correctos
  const { feelings, needs } = useGenderData();

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentStep]);

  const validateStep = () => {
    if (currentStep === 0 && !formData.observation) {
      toast({ title: "Error", description: "Por favor describe la situación", variant: "destructive" }); return false;
    }
    if (currentStep === 1 && formData.feelings.length === 0) {
      toast({ title: "Error", description: "Por favor selecciona al menos un sentimiento", variant: "destructive" }); return false;
    }
    if (currentStep === 2 && formData.needs.length === 0) {
      toast({ title: "Error", description: "Por favor selecciona al menos una necesidad", variant: "destructive" }); return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep === steps.length - 1) {
      setFormData({ observation: "", feelings: [], needs: [], requests: [] });
      setCurrentStep(0);
    } else {
      setCurrentStep(p => p + 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <ObservationStep value={formData.observation} onChange={v => setFormData({ ...formData, observation: v })} />;
      case 1: return <FeelingsStep selectedFeelings={formData.feelings} onChange={v => setFormData({ ...formData, feelings: v })} feelings={feelings} />;
      case 2: return <NeedsStep selectedNeeds={formData.needs} onChange={v => setFormData({ ...formData, needs: v })} needs={needs} />;
      case 3: return <RequestStep requests={formData.requests} onChange={v => setFormData({ ...formData, requests: v })} />;
      case 4: return <SummaryStep formData={formData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-8">
          {steps.map((step, i) => (
            <div key={step} className={`text-sm ${i === currentStep ? "text-blue-600 font-bold" : "text-gray-400"}`}>{step}</div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-4 mt-8">
          {currentStep > 0 && <Button onClick={() => setCurrentStep(p => p - 1)} variant="outline">Atrás</Button>}
          <Button onClick={handleNext}>{currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}</Button>
        </div>
      </div>
    </div>
  );
}
