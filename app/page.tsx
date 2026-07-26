"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import PWARegister from "@/components/pwa-register";

type Gender = "hombre" | "mujer";

export default function Home() {
  const [gender, setGender] = useState<Gender | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cnv_gender") as Gender | null;
    if (saved === "hombre" || saved === "mujer") {
      setGender(saved);
    }
  }, []);

  const selectGender = (g: Gender) => {
    setGender(g);
    localStorage.setItem("cnv_gender", g);
  };

  return (
    <main className="min-h-screen gradient-bg dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Mi Conexión Interna
        </h1>

        <p className="italic text-gray-600 dark:text-gray-400 mb-4">
          "¿Qué parte dentro de ti quiere ser escuchada hoy?"
        </p>

        <Card className="p-6 mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Un espacio seguro para reconectar contigo mismo, escuchando tus
            sentimientos y necesidades con compasión.
          </p>

          {/* Selección de género */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Selecciona tu perfil:
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => selectGender("hombre")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                  gender === "hombre"
                    ? "bg-blue-500 text-white border-blue-500 shadow-md scale-105"
                    : "bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-600 hover:border-blue-400 hover:shadow"
                }`}
              >
                Hombre
              </button>
              <button
                onClick={() => selectGender("mujer")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                  gender === "mujer"
                    ? "bg-purple-500 text-white border-purple-500 shadow-md scale-105"
                    : "bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-600 hover:border-purple-400 hover:shadow"
                }`}
              >
                Mujer
              </button>
            </div>
            {gender && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Perfil guardado: <strong>{gender}</strong>
              </p>
            )}
          </div>

          <Link href={gender ? "/dashboard" : "#"}>
            <Button
              className={`w-full md:w-auto button-hover text-white transition-opacity ${
                gender
                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                  : "bg-gray-300 dark:bg-slate-600 pointer-events-none cursor-not-allowed"
              }`}
              size="lg"
              disabled={!gender}
            >
              Iniciar mi momento de conexión
            </Button>
          </Link>

          {!gender && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Selecciona un perfil para continuar
            </p>
          )}
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-600 dark:text-gray-400 space-y-2"
        >
          <p>Basado en los principios de la Comunicación No Violenta (CNV)</p>
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="font-medium">Version 4.0</p>
            <p className="font-medium">Desarrollado por Marlon Ortiz</p>
          </div>
        </motion.div>
      </motion.div>

      <PWARegister />
    </main>
  );
}