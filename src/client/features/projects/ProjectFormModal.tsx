import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProject, updateProject } from "@/serverFunctions/keywords";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { PROJECTS_QUERY_KEY, type ProjectSummary } from "./useProjects";

type Props = {
  project: ProjectSummary | null;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
};

export function ProjectFormModal({ project, onClose, onCreated }: Props) {
  const queryClient = useQueryClient();
  const isEditing = project !== null;
  const [name, setName] = useState(project?.name ?? "");
  const [domain, setDomain] = useState(project?.domain ?? "");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const values = { name: name.trim(), domain: domain.trim() };
      if (project) {
        await updateProject({ data: { projectId: project.id, ...values } });
        return project.id;
      }
      const created = await createProject({ data: values });
      return created.id;
    },
    onSuccess: async (projectId) => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success(isEditing ? "Projeto atualizado" : "Projeto criado");
      if (!isEditing) onCreated?.(projectId);
      onClose();
    },
    onError: (mutationError) => {
      setError(
        getStandardErrorMessage(mutationError, "Falha ao salvar o projeto."),
      );
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Informe o nome do projeto.");
      return;
    }
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="modal modal-open">
      <form className="modal-box space-y-4" onSubmit={handleSubmit}>
        <h3 className="font-bold text-lg">
          {isEditing ? "Editar projeto" : "Novo projeto"}
        </h3>

        <label className="form-control w-full gap-1.5">
          <span className="text-sm font-medium">Nome do projeto</span>
          <input
            className="input input-bordered w-full"
            placeholder="Ex.: Clínica Bem Viver"
            value={name}
            maxLength={120}
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="form-control w-full gap-1.5">
          <span className="text-sm font-medium">Domínio (opcional)</span>
          <input
            className="input input-bordered w-full"
            placeholder="exemplo.com.br"
            value={domain}
            maxLength={255}
            onChange={(event) => setDomain(event.target.value)}
          />
          <span className="text-xs text-base-content/60">
            Usado no monitoramento de posições para encontrar seu site no
            Google.
          </span>
        </label>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            {isEditing ? "Salvar alterações" : "Criar projeto"}
          </button>
        </div>
      </form>
      <button
        type="button"
        aria-label="Fechar"
        className="modal-backdrop"
        onClick={onClose}
      />
    </div>
  );
}
