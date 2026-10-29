import * as React from "react";
import { Link, Outlet } from "@tanstack/react-router";
import {
  AlertTriangle,
  ExternalLink,
  Menu,
} from "lucide-react";
import { Sidebar } from "@/client/components/Sidebar";
import { projectNavItems } from "@/client/navigation/items";
import { BalanceButton } from "@/client/layout/BalancePanel";
import { ProjectSwitcher } from "@/client/features/projects/ProjectSwitcher";

export function TopNav({
  drawerOpen,
  projectId,
  pathname,
  onOpenDrawer,
}: {
  drawerOpen: boolean;
  projectId: string | null;
  pathname: string;
  onOpenDrawer: () => void;
}) {
  return (
    <div className="navbar bg-base-100 border-b border-base-300 shrink-0 gap-2">
      <div className="flex-none flex items-center md:hidden">
        <button
          type="button"
          className="btn btn-square btn-ghost"
          aria-label="Abrir menu lateral"
          aria-expanded={drawerOpen}
          onClick={onOpenDrawer}
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-semibold text-base-content ml-1">OpenSEO</span>
      </div>

      <div className="flex-1 md:hidden" />
      <div className="flex-none md:hidden">
        <BalanceButton compact />
      </div>

      <div className="hidden md:flex items-center gap-1">
        <span className="text-lg font-semibold text-base-content px-2">
          OpenSEO
        </span>
        {projectId
          ? projectNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.includes(item.matchSegment);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  params={{ projectId }}
                  className={`btn btn-sm gap-2 ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium border-transparent"
                      : "btn-ghost text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })
          : null}
      </div>

      <div className="hidden md:block flex-1" />

      <div className="flex-none hidden md:flex items-center gap-1">
        <BalanceButton />
        <ProjectSwitcher projectId={projectId} pathname={pathname} />
      </div>
    </div>
  );
}

export function SeoApiStatusBanners({
  helpPath,
  shouldShowSeoApiWarning,
  seoApiKeyStatusError,
}: {
  helpPath: string;
  shouldShowSeoApiWarning: boolean;
  seoApiKeyStatusError: boolean;
}) {
  return (
    <>
      {shouldShowSeoApiWarning ? (
        <div className="shrink-0 px-4 py-2.5 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="alert alert-warning">
              <AlertTriangle className="size-4 shrink-0" />
              <span className="text-sm">
                Configuração necessária: adicione sua chave da API DataForSEO
                para usar os recursos do OpenSEO. Veja o passo a passo na{" "}
                <Link to={helpPath} className="link link-primary font-medium">
                  página de ajuda
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {seoApiKeyStatusError ? (
        <div className="shrink-0 px-4 py-2.5 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="alert alert-info">
              <AlertTriangle className="size-4 shrink-0" />
              <span className="text-sm">
                Não foi possível verificar sua configuração da DataForSEO. Se
                algo não funcionar, confira o passo a passo na{" "}
                <Link to={helpPath} className="link link-primary font-medium">
                  página de ajuda
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AppContent({
  drawerOpen,
  pathname,
  projectId,
  onCloseDrawer,
}: {
  drawerOpen: boolean;
  pathname: string;
  projectId: string | null;
  onCloseDrawer: () => void;
}) {
  return (
    <>
      <div className="flex-1 min-h-0 md:hidden">
        <div className="h-full overflow-auto">
          <Outlet />
        </div>

        {drawerOpen ? (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Fechar menu lateral"
              className="absolute inset-0 bg-black/45"
              onClick={onCloseDrawer}
            />
            <div className="absolute left-0 top-0 h-full">
              <Sidebar
                currentPath={pathname}
                projectId={projectId}
                onNavigate={onCloseDrawer}
                onClose={onCloseDrawer}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="hidden md:block flex-1 min-h-0 overflow-auto">
        <Outlet />
      </div>
    </>
  );
}

export const MissingSeoSetupModal = React.forwardRef<
  HTMLDivElement,
  {
    helpPath: string;
    isOpen: boolean;
    onClose: () => void;
  }
>(({ helpPath, isOpen, onClose }, ref) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dataforseo-setup-title"
        aria-describedby="dataforseo-setup-description"
        tabIndex={-1}
        className="w-full max-w-lg rounded-xl border border-base-300 bg-base-100 p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-warning/20 p-2 text-warning">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-2">
            <h2
              id="dataforseo-setup-title"
              className="text-lg font-semibold text-base-content"
            >
              Falta só um passo
            </h2>
            <p
              id="dataforseo-setup-description"
              className="text-sm text-base-content/75"
            >
              Adicione sua chave da API DataForSEO para começar a usar o
              OpenSEO.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Agora não
          </button>
          <Link to={helpPath} className="btn btn-primary" onClick={onClose}>
            Abrir guia de configuração
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
});

MissingSeoSetupModal.displayName = "MissingSeoSetupModal";
