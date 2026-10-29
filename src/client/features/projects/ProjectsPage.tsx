import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bookmark,
  CalendarDays,
  FolderOpen,
  Globe,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { deleteProject } from "@/serverFunctions/keywords";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { ProjectFormModal } from "./ProjectFormModal";
import { loadLastProjectId } from "./projectStorage";
import {
  PROJECTS_QUERY_KEY,
  formatProjectDate,
  useProjects,
  type ProjectSummary,
} from "./useProjects";

type FormState = { mode: "create" } | { mode: "edit"; project: ProjectSummary };

export function ProjectsPage() {
  const projectsQuery = useProjects();
  const [form, setForm] = useState<FormState | null>(null);
  const [toDelete, setToDelete] = useState<ProjectSummary | null>(null);
  const lastProjectId = loadLastProjectId();
  const projects = projectsQuery.data ?? [];

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Projetos</h1>
            <p className="text-sm text-base-content/70">
              Organize suas pesquisas por cliente ou site. Cada projeto guarda
              as próprias palavras salvas, posições, auditorias e dados de IA.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm gap-2"
            onClick={() => setForm({ mode: "create" })}
          >
            <Plus className="size-4" />
            Novo projeto
          </button>
        </div>

        {projectsQuery.isLoading ? (
          <ProjectsLoadingState />
        ) : projectsQuery.isError ? (
          <div className="alert alert-error text-sm">
            {getStandardErrorMessage(
              projectsQuery.error,
              "Não foi possível carregar os projetos.",
            )}
          </div>
        ) : projects.length === 0 ? (
          <EmptyProjectsState onCreate={() => setForm({ mode: "create" })} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isCurrent={project.id === lastProjectId}
                onEdit={() => setForm({ mode: "edit", project })}
                onDelete={() => setToDelete(project)}
              />
            ))}
          </div>
        )}
      </div>

      {form ? (
        <ProjectFormModal
          project={form.mode === "edit" ? form.project : null}
          onClose={() => setForm(null)}
        />
      ) : null}

      {toDelete ? (
        <DeleteProjectDialog
          project={toDelete}
          onClose={() => setToDelete(null)}
        />
      ) : null}
    </div>
  );
}

function ProjectCard({
  project,
  isCurrent,
  onEdit,
  onDelete,
}: {
  project: ProjectSummary;
  isCurrent: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`card bg-base-100 border transition-colors hover:border-primary/60 ${
        isCurrent ? "border-primary/50" : "border-base-300"
      }`}
    >
      <div className="card-body gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/p/$projectId/saved"
            params={{ projectId: project.id }}
            className="min-w-0 flex-1"
          >
            <h2 className="truncate text-lg font-semibold hover:text-primary">
              {project.name}
            </h2>
            <p className="flex items-center gap-1.5 truncate text-sm text-base-content/60">
              <Globe className="size-3.5 shrink-0" />
              {project.domain || "Sem domínio definido"}
            </p>
          </Link>
          <div className="flex items-center gap-1">
            {isCurrent ? (
              <span className="badge badge-primary badge-outline badge-sm">
                Atual
              </span>
            ) : null}
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="btn btn-ghost btn-xs btn-square"
                aria-label={`Ações do projeto ${project.name}`}
              >
                <MoreVertical className="size-4" />
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu z-10 w-40 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg"
              >
                <li>
                  <button onClick={onEdit}>
                    <Pencil className="size-4" />
                    Editar
                  </button>
                </li>
                <li>
                  <button className="text-error" onClick={onDelete}>
                    <Trash2 className="size-4" />
                    Excluir
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-base-content/70">
          <span className="badge badge-ghost gap-1">
            <Bookmark className="size-3" />
            {project.savedKeywordCount}{" "}
            {project.savedKeywordCount === 1
              ? "palavra salva"
              : "palavras salvas"}
          </span>
          <span className="badge badge-ghost gap-1">
            <CalendarDays className="size-3" />
            Criado em {formatProjectDate(project.createdAt)}
          </span>
        </div>

        <div className="card-actions justify-end pt-1">
          <Link
            to="/p/$projectId/keywords"
            params={{ projectId: project.id }}
            className="btn btn-ghost btn-sm"
          >
            Pesquisar
          </Link>
          <Link
            to="/p/$projectId/saved"
            params={{ projectId: project.id }}
            className="btn btn-primary btn-sm gap-1.5"
          >
            <FolderOpen className="size-4" />
            Abrir
          </Link>
        </div>
      </div>
    </div>
  );
}

function DeleteProjectDialog({
  project,
  onClose,
}: {
  project: ProjectSummary;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteProject({ data: { projectId: project.id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      toast.success("Projeto excluído");
      onClose();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Falha ao excluir."));
    },
  });

  return (
    <div className="modal modal-open">
      <div className="modal-box space-y-3">
        <h3 className="font-bold text-lg">Excluir “{project.name}”?</h3>
        <p className="text-sm text-base-content/70">
          Isso apaga definitivamente as palavras salvas, posições, auditorias e
          dados de visibilidade em IA deste projeto. Não é possível desfazer.
        </p>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-error"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            Excluir projeto
          </button>
        </div>
      </div>
      <button
        type="button"
        aria-label="Fechar"
        className="modal-backdrop"
        onClick={onClose}
      />
    </div>
  );
}

function EmptyProjectsState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 bg-base-100/70 p-10 text-center space-y-3">
      <FolderOpen className="mx-auto size-10 text-base-content/40" />
      <p className="text-lg font-medium">Nenhum projeto ainda</p>
      <button className="btn btn-primary btn-sm" onClick={onCreate}>
        Criar primeiro projeto
      </button>
    </div>
  );
}

function ProjectsLoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="card border border-base-300 bg-base-100">
          <div className="card-body gap-3 p-5">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-6 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
