import React from 'react';
import { MessageSquare, FileText, Activity, KeyRound, Settings2, AlertCircle, MessagesSquare, PlusCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  className?: string;
}

const sidebarLinks = [
  { icon: MessageSquare, label: "Chat", href: "/" },
  { icon: FileText, label: "Documentación", href: "/docs" },
  { icon: Activity, label: "Métricas", href: "/metrics" },
  { icon: KeyRound, label: "Claves API", href: "/api-keys" },
  { icon: Settings2, label: "Configuración", href: "/settings" },
  { icon: AlertCircle, label: "Estado", href: "/status" },
  { icon: MessagesSquare, label: "Discord", href: "/discord" },
];

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  
  const onNewChat = () => {
    // Implementar la lógica para crear un nuevo chat
    console.log("Nuevo chat");
  };

  return (
    <div className={cn('flex flex-col h-full w-[200px] bg-background p-4 border-r', className)}>
      {/* Logo y título */}
      <div className="px-3 py-2 flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src="/perfil.jpg"
            alt="Angel AI"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-lg font-semibold text-white">Angel</h2>
      </div>

      {/* Botón Nuevo Chat */}
      <button
        onClick={onNewChat}
        className="flex items-center w-full gap-2 px-3 py-2 my-4 text-white bg-[#0a1a2f] hover:bg-[#0f2a47] rounded-lg transition-all duration-200 group"
      >
        <PlusCircle className="w-5 h-5" />
        <span>Nuevo Chat</span>
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </button>

      {/* Navegación principal */}
      <nav className="space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Icon className="h-4 w-4 mr-3 shrink-0" />
              {link.label}
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
          );
        })}
      </nav>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={() => navigate('/login')}
        className="group flex items-center px-3 py-2 mt-auto text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-500/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <LogOut className="h-4 w-4 mr-3 shrink-0 group-hover:text-red-400" />
        <span className="group-hover:text-red-400">Cerrar Sesión</span>
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-red-400 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </button>
    </div>
  );
}
