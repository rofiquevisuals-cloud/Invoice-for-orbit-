import React from 'react';
import {
  FileEdit,
  Database,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { OrbitLogo } from './OrbitLogo';

export type ActiveTab = 'studio' | 'history' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewDocument: () => void;
  documentCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onNewDocument,
  documentCount,
}) => {
  return (
    <header className="no-print bg-neutral-950 border-b border-neutral-850 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Zone 1: Orbit360Hub Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <OrbitLogo variant="horizontal" theme="dark" size="sm" />
          </div>

          {/* Zone 2: Navigation Links (scrollable or compact on mobile) */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => onSelectTab('studio')}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'studio'
                  ? 'bg-neutral-900 text-lime-400 border border-neutral-800 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('history')}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'history'
                  ? 'bg-neutral-900 text-lime-400 border border-neutral-800 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Database & History</span>
              <span className="sm:hidden">History</span>
              {documentCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                  {documentCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('settings')}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-neutral-900 text-lime-400 border border-neutral-800 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agency Settings</span>
              <span className="sm:hidden">Settings</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onNewDocument}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-lime-400 text-neutral-950 hover:bg-lime-300 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Document</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
