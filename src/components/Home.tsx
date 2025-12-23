import React from 'react';
import { Tv, UserCircle, TicketPlus, Shield, BarChart3 } from 'lucide-react';
import type { Screen } from '../App';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const modules = [
    {
      id: 'painel-publico' as Screen,
      title: 'Painel Público',
      description: 'Visualização para TV',
      icon: Tv,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'atendente' as Screen,
      title: 'Atendente',
      description: 'Gerenciar fila',
      icon: UserCircle,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'gerador' as Screen,
      title: 'Gerador de Senhas',
      description: 'Triagem e emissão',
      icon: TicketPlus,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      id: 'admin' as Screen,
      title: 'Administrador',
      description: 'Configurações',
      icon: Shield,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'dashboard' as Screen,
      title: 'Dashboard',
      description: 'Monitoramento',
      icon: BarChart3,
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
              <div className="text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-14 w-14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-white text-7xl mb-4 tracking-tight">Atende+</h1>
          <p className="text-blue-100 text-2xl">Sistema de Gerenciamento de Filas</p>
          <p className="text-blue-200 mt-3">Lauro de Freitas - Bolsa Familía</p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(module => (
            <button
              key={module.id}
              onClick={() => onNavigate(module.id)}
              className={`${module.color} text-white p-8 rounded-2xl shadow-2xl transition-all duration-200 transform hover:scale-105 hover:shadow-3xl`}
            >
              <div className="flex flex-col items-center text-center">
                <module.icon className="w-16 h-16 mb-4" />
                <h3 className="text-2xl mb-2">{module.title}</h3>
                <p className="text-white/90">{module.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-blue-200">
          <p>© 2026 Prefeitura Municipal - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
