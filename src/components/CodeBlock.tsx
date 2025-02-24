import { useEffect, useRef, useState } from "react";
import { Copy, Check, Settings2 } from "lucide-react";

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
      <div className="relative my-4 rounded-lg overflow-hidden bg-gray-900 group shadow-lg border border-border/5">
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"></div>
            <div
              className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative my-4 rounded-lg overflow-hidden bg-gray-900 group shadow-lg border border-border/5 ${
        showLineNumbers ? "line-numbers" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300 text-sm border-b border-border/10">
        <div className="flex items-center gap-4">
          <span className="font-medium">{language}</span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-700 transition-all duration-200"
            title="Configuración"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-700 transition-all duration-200"
          title={isCopied ? "Código copiado!" : "Copiar código"}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-xs">Copiar</span>
            </>
          )}
        </button>
      </div>

      {showSettings && (
        <div className="absolute top-12 left-4 z-10 w-64 bg-gray-800 rounded-lg shadow-lg border border-border/10 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tema
              </label>
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="w-full bg-gray-700 text-gray-300 rounded-md px-3 py-1.5 text-sm"
              >
                {Object.entries(themes).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tamaño de fuente
              </label>
              <input
                type="range"
                min="12"
                max="20"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-400">{fontSize}px</span>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Mostrar números de línea
              </label>
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded border-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      <pre
        className={`p-4 m-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <code
          ref={codeRef}
          className={`language-${language} theme-${currentTheme}`}
        >
          {code}
        </code>
      </pre>
    </div>
  );
};
