import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  getOrCreateDefaultProject,
  listProjects,
} from "@/serverFunctions/keywords";
import { loadLastProjectId } from "@/client/features/projects/projectStorage";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();

  const { mutate, error, isError } = useMutation({
    mutationFn: async () => {
      // Reopen the last project used, falling back to the default one.
      const lastProjectId = loadLastProjectId();
      if (lastProjectId) {
        const projects = await listProjects();
        const last = projects.find((project) => project.id === lastProjectId);
        if (last) return last;
      }
      return getOrCreateDefaultProject();
    },
    onSuccess: (project) => {
      void navigate({
        to: "/p/$projectId/keywords",
        params: { projectId: project.id },
      });
    },
  });

  // Run once: repeated calls used to create duplicate default projects.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    mutate();
  }, [mutate]);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="flex flex-col items-center gap-3 max-w-xl">
          <p className="text-error text-center">
            {getStandardErrorMessage(
              error,
              "Ocorreu um erro inesperado. Verifique os logs do servidor.",
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <span className="loading loading-spinner loading-md" />
    </div>
  );
}
