"use client";

import { useCallback, useState } from "react";
import { useTheme } from "next-themes";
import { submitOnboarding } from "@/app/actions/submitOnboarding";
import { HCaptcha } from "@/components/HCaptcha";
import { HoneypotFields } from "@/components/HoneypotFields";

const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY);

export default function BoeOnboardingPage() {
  const { resolvedTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const onCaptchaVerify = useCallback((token: string) => setCaptchaToken(token), []);
  const onCaptchaExpire = useCallback(() => setCaptchaToken(""), []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    if (captchaEnabled && !captchaToken) {
      setStatus("error");
      setErrorMessage("Completa la verificación antispam.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    if (captchaToken) formData.set("captchaToken", captchaToken);
    const result = await submitOnboarding(formData);
    
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error || "Ocurrió un error al guardar los datos.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6">
        <div className="bg-neutral-900 border border-neutral-800 p-12 rounded-xl text-center max-w-lg">
          <h2 className="text-3xl font-bold text-white mb-4">¡Configuración Recibida!</h2>
          <p className="text-neutral-400">
            Tus datos han sido volcados en nuestra base de datos. El equipo de Mavie revisará las palabras clave y activará tu Radar en las próximas horas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-24 pb-24 px-6 items-center">
      <div className="w-full max-w-3xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-300 mb-4">
            Paso {step} de 2
          </div>
          <h1 className="text-3xl font-bold mb-4">Configuración Onboarding de Radar BOE</h1>
          <p className="text-neutral-400">Completa este formulario técnico para parametrizar tus alertas diarias.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl space-y-8">
          <HoneypotFields />

          {status === "error" && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md text-sm">
              Error: {errorMessage}
            </div>
          )}

          {/* Conservamos el valor de step 1 al pasar al step 2 usando clases ocultas o condicionales complejos, 
              pero en un form nativo es más sencillo renderizar ambos y ocultar con CSS, así los inputs no pierden state */}
          
          <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${step !== 1 ? 'hidden' : ''}`}>
            <h3 className="text-xl font-medium border-b border-neutral-800 pb-4">1. Datos Operativos</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Empresa (Exacta)</label>
                <input required={step === 1} name="companyName" type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-md h-12 px-4 focus:ring-1 focus:ring-neutral-500 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Teléfono de Soporte Técnico</label>
                <input required={step === 1} name="phone" type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-md h-12 px-4 focus:ring-1 focus:ring-neutral-500 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Emails de Destino de Alertas (separados por coma)</label>
              <input required={step === 1} name="emails" type="text" placeholder="info@..., direccion@..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md h-12 px-4 focus:ring-1 focus:ring-neutral-500 text-white" />
              <p className="text-xs text-neutral-500">A estos correos llegará el resumen de oportunidades.</p>
            </div>

            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => setStep(2)} className="h-12 px-8 rounded-md bg-white text-black font-medium hover:bg-neutral-200">
                Siguiente Paso
              </button>
            </div>
          </div>

          <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${step !== 2 ? 'hidden' : ''}`}>
            <h3 className="text-xl font-medium border-b border-neutral-800 pb-4">2. Reglas de Inteligencia Artificial</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Palabras Clave Positivas (separadas por coma)</label>
              <textarea required={step === 2} name="keywords" rows={3} placeholder="Mantenimiento de infraestructura, Obras civiles, Software de gestión..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-4 focus:ring-1 focus:ring-neutral-500 text-white" />
              <p className="text-xs text-neutral-500">El radar buscará estas expresiones o contextos similares.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Palabras Excluyentes (Antikeywords)</label>
              <textarea name="antiKeywords" rows={2} placeholder="Suministro de papel, Vehículos, Restauración..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-4 focus:ring-1 focus:ring-neutral-500 text-white" />
              <p className="text-xs text-neutral-500">Si un contrato contiene esto explícitamente, se descartará de tu bandeja.</p>
            </div>

            <label className="flex items-start gap-3 text-sm text-neutral-400 cursor-pointer">
              <input type="checkbox" required name="consent" className="mt-0.5 h-4 w-4 rounded border-neutral-700 text-blue-600 focus:ring-blue-500" />
              <span>
                Acepto la{" "}
                <a href="/privacidad" className="underline hover:text-blue-400 transition-colors">política de privacidad</a>{" "}
                y el tratamiento de mis datos para la configuración del servicio.
              </span>
            </label>

            {captchaEnabled && (
              <HCaptcha onVerify={onCaptchaVerify} onExpire={onCaptchaExpire} theme={resolvedTheme === "light" ? "light" : "dark"} />
            )}

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)} className="h-12 px-8 rounded-md border border-neutral-800 bg-transparent text-white font-medium hover:bg-neutral-800">
                Volver
              </button>
              <button type="submit" disabled={status === "submitting"} className="h-12 px-8 rounded-md bg-white text-black font-medium hover:bg-neutral-200 disabled:opacity-50">
                {status === "submitting" ? "Conectando BBDD..." : "Finalizar y Guardar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
