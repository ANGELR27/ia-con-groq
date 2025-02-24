import { useEffect, useRef, useState } from "react";
import { Copy, Check, Settings2, X } from "lucide-react";

// Importación dinámica de Prism
let Prism: any = null;

async function loadPrism() {
  if (typeof window !== "undefined" && !Prism) {
    const prismModule = await import("prismjs");
    Prism = prismModule.default;

    // Importar temas
    await import("prismjs/themes/prism-tomorrow.css");
    await import("prismjs/themes/prism-okaidia.css");
    await import("prismjs/themes/prism-solarizedlight.css");
    await import("prismjs/plugins/line-numbers/prism-line-numbers.css");
    await import("prismjs/plugins/line-numbers/prism-line-numbers");

    // Importar lenguajes
    await import("prismjs/components/prism-javascript");
    await import("prismjs/components/prism-typescript");
    await import("prismjs/components/prism-jsx");
    await import("prismjs/components/prism-tsx");
    await import("prismjs/components/prism-python");
    await import("prismjs/components/prism-java");
    await import("prismjs/components/prism-c");
    await import("prismjs/components/prism-cpp");
    await import("prismjs/components/prism-csharp");
    await import("prismjs/components/prism-json");
    await import("prismjs/components/prism-css");
    await import("prismjs/components/prism-sql");
  }
}

interface CodeBlockProps {
  code: string;
  language: string;
}

const themes = {
  tomorrow: "Tomorrow Night",
  okaidia: "Okaidia",
  solarizedlight: "Solarized Light",
};

export const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPrismLoaded, setIsPrismLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("tomorrow");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);

  useEffect(() => {
    loadPrism().then(() => {
      setIsPrismLoaded(true);
      if (codeRef.current && Prism) {
        Prism.highlightElement(codeRef.current);
      }
    });
  }, []);

  useEffect(() => {
    if (isPrismLoaded && codeRef.current && Prism) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, isPrismLoaded, currentTheme, showLineNumbers]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  if (!isPrismLoaded) {
    return (
      <div className="code-block-container">
        <div className="relative rounded-lg overflow-hidden bg-background/30 backdrop-blur-md">
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse delay-200"></div>
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse delay-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="code-block-container group">
      <div className={`relative rounded-xl overflow-hidden bg-[#1a1b26] ${
        showLineNumbers ? "line-numbers" : ""
      }`}>
        {/* Barra superior con controles */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#16171f] border-b border-slate-700/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/30"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-400/30"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/30"></div>
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {language}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg hover:bg-slate-700/30 transition-colors group"
              title="Configuración"
            >
              <Settings2 className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
            </button>
            
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group"
              title={isCopied ? "¡Código copiado!" : "Copiar código"}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    Copiar
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panel de configuración */}
        {showSettings && (
          <div className="absolute top-14 right-4 z-10 w-72 rounded-xl bg-[#1a1b26] border border-slate-700/20 shadow-xl">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700/20">
              <h3 className="text-sm font-medium text-slate-300">Configuración</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-300 transition-colors" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Tema
                </label>
                <select
                  value={currentTheme}
                  onChange={(e) => setCurrentTheme(e.target.value)}
                  className="w-full bg-[#16171f] border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {Object.entries(themes).map(([value, label]) => (
                    <option key={value} value={value} className="bg-[#1a1b26] text-slate-300">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Tamaño de fuente: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-400">
                  Números de línea
                </label>
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="rounded border-slate-700/30 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contenedor del código */}
        <div className="relative">
          <pre className="p-6 m-0 overflow-x-auto" style={{ fontSize: `${fontSize}px` }}>
            <code ref={codeRef} className={`language-${language} theme-${currentTheme}`}>
              {code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
