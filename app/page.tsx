"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Mi Conexión Interna
        </h1>
        
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm">
          <p className="text-lg text-gray-700 mb-6">
            Un espacio seguro para explorar tus sentimientos y necesidades a través de la Comunicación No Violenta.
          </p>
          
          <Link href="/dashboard">
            <Button 
              className="w-full md:w-auto button-hover bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              size="lg"
            >
              Comenzar Sesión de Conexión
            </Button>
          </Link>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-600 space-y-2"
        >
          <p>Basado en los principios de la Comunicación No Violenta (CNV)</p>
          <div className="pt-4 border-t border-gray-200">
<p className="font-medium">Version 2.0 Mujeres</p>
<p className="font-medium">  </p>
            <p className="font-medium">Desarrollado por Marlon Ortiz</p>
            <a 
              href="mailto:marlon.moe24@gmail.com"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              marlon.moe24@gmail.com
            </a>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
