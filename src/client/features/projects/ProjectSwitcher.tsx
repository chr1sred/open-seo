import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronsUpDown, FolderKanban, Plus } from "lucide-react";
import { projectNavItems } from "@/client/navigation/items";
import { ProjectFormModal } from "./ProjectFormModal";
import { useProjects } from "./useProjects";

type Props = {
  projectId: string | null;
  pathname: string;
  fullWidth?: boolean;
  onNavigate?: () => void;
};

export function ProjectSwitcher({
  projectId,
  pathname,
  fullWidth = false,
  onNavigate,
}: Props) {
  const navigate = useNavigate();
  const projectsQuery = useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const projects = projectsQuery.data ?? [];
  const current = projects.find((project) => project.id === projectId);
  const { isFetching, isSuccess, refetch } = projectsQuery;

  // The list may have been cached before this project existed: refetch once.
  const refetchedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!projectId || !isSuccess || isFetching || current) return;
    if (refetchedForRef.current === projectId) return;
    refetchedForRef.current = projectId;
    void refetch();
  }, [projectId, isSuccess, isFetching, current, refetch]);

  const label = current?.name ?? (projectId ? "Carregando..." : "Projetos");

  // Keep the user on the same section when switching projects.
  const section =
    projectNavItems.find((item) => pathname.includes(item.matchSegment)) ??
    projectNavItems[0];

  const switchTo = (nextProjectId: string) => {
    closeDropdown();
    onNavigate?.();
    void navigate({ to: section.to, params: { projectId: nextProjectId } });
  };

  return (
    <>
      <div className={`dropdown dropdown-end ${fullWidth ? "w-full" : ""}`}>
        <button
          tabIndex={0}
          className={`btn btn-ghost btn-sm font-medium text-sm gap-1 ${
            fullWidth ? "w-full justify-between" : "max-w-56"
          }`}
          aria-label="Trocar de projeto"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-base-content/40" />
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-30 mt-1 w-64 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg"
        >
          <li className="menu-title text-xs">Seus projetos</li>
          {projects.map((project) => (
            <li key={project.id}>
              <button onClick={() => switchTo(project.id)}>
                <span className="flex-1 truncate text-left">
                  {project.name}
                </span>
                {project.id === projectId ? (
                  <Check className="size-4 text-primary" />
                ) : null}
              </button>
            </li>
          ))}
          <div className="my-1 border-t border-base-300" />
          <li>
            <button
              onClick={() => {
                closeDropdown();
                setIsCreating(true);
              }}
            >
              <Plus className="size-4" />
              Novo projeto
            </button>
          </li>
          <li>
            <Link
              to="/projects"
              onClick={() => {
                closeDropdown();
                onNavigate?.();
              }}
            >
              <FolderKanban className="size-4" />
              Gerenciar projetos
            </Link>
          </li>
        </ul>
      </div>

      {isCreating ? (
        <ProjectFormModal
          project={null}
          onClose={() => setIsCreating(false)}
          onCreated={switchTo}
        />
      ) : null}
    </>
  );
}

// DaisyUI dropdowns stay open while focused; blur to close after a choice.
function closeDropdown() {
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
}
