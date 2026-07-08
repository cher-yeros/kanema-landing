"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useId, useRef, useState } from "react";
import {
  DELETE_PORTFOLIO_MUTATION,
  PORTFOLIO_QUERY,
  UPSERT_PORTFOLIO_MUTATION,
} from "@/lib/forum-graphql";
import { forumMediaUploadUrl } from "@/lib/graphql-env";

type PortfolioProject = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  display_order: number;
};

type PortfolioFormState = {
  id?: string;
  title: string;
  description: string;
  cover_url: string;
};

const emptyForm = (): PortfolioFormState => ({
  title: "",
  description: "",
  cover_url: "",
});

export function PortfolioProjectsEditor() {
  const formId = useId();
  const { data, refetch } = useQuery(PORTFOLIO_QUERY);
  const [upsertProject, { loading: saving }] = useMutation(
    UPSERT_PORTFOLIO_MUTATION,
  );
  const [deleteProject, { loading: deleting }] = useMutation(
    DELETE_PORTFOLIO_MUTATION,
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<PortfolioFormState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projects =
    (
      data as {
        myPortfolioProjects?: PortfolioProject[];
      }
    )?.myPortfolioProjects ?? [];

  function startCreate() {
    setError(null);
    setForm(emptyForm());
  }

  function startEdit(project: PortfolioProject) {
    setError(null);
    setForm({
      id: project.id,
      title: project.title,
      description: project.description ?? "",
      cover_url: project.cover_url ?? "",
    });
  }

  function cancelForm() {
    setForm(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onCoverSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || !form) return;

    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch(forumMediaUploadUrl(), {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Could not upload image.");
      }
      setForm({ ...form, cover_url: json.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const title = form.title.trim();
    if (!title) {
      setError("Please enter a title.");
      return;
    }

    setError(null);
    await upsertProject({
      variables: {
        input: {
          id: form.id,
          title,
          description: form.description.trim() || null,
          cover_url: form.cover_url.trim() || null,
          display_order: form.id ? undefined : projects.length,
        },
      },
    });
    await refetch();
    cancelForm();
  }

  async function removeProject(id: string) {
    if (!window.confirm("Remove this showcase item?")) return;
    await deleteProject({ variables: { id } });
    await refetch();
    if (form?.id === id) cancelForm();
  }

  return (
    <div className="form-panel form-panel--embedded">
      <div className="form-intro">
        <i className="bi bi-images" aria-hidden />
        <h3>Work showcase</h3>
        <p>
          Upload work with a title, description, and image. Visible on your
          public community profile.
        </p>
      </div>

      {!form ? (
        <button
          type="button"
          className="btn btn-accent mb-4"
          onClick={startCreate}
        >
          <i className="bi bi-plus-circle-fill" aria-hidden />
          Add work
        </button>
      ) : null}

      {form ? (
        <form
          onSubmit={saveProject}
          className="php-email-form portfolio-editor-form mb-4"
        >
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor={`${formId}-title`} className="form-label">
                Title
              </label>
              <input
                id={`${formId}-title`}
                className="form-control"
                placeholder="Project or shoot name"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor={`${formId}-description`} className="form-label">
                Description
              </label>
              <textarea
                id={`${formId}-description`}
                className="form-control"
                rows={5}
                placeholder="What you created, your role, and what makes this work stand out…"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="col-12">
              <label htmlFor={`${formId}-cover`} className="form-label">
                Showcase image
              </label>
              <div className="portfolio-editor-form__upload">
                {form.cover_url ? (
                  <img
                    src={form.cover_url}
                    alt=""
                    className="portfolio-editor-form__preview"
                  />
                ) : (
                  <div className="portfolio-editor-form__preview portfolio-editor-form__preview--empty">
                    <i className="bi bi-image" aria-hidden />
                  </div>
                )}
                <div className="portfolio-editor-form__upload-field">
                  <input
                    ref={fileRef}
                    id={`${formId}-cover`}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="form-control"
                    disabled={uploading}
                    onChange={(e) => onCoverSelected(e.target.files)}
                  />
                  <p className="portfolio-editor-form__hint">
                    JPEG, PNG, WebP, or GIF.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error ? <p className="error-message d-block mt-3 mb-0">{error}</p> : null}

          <div className="d-flex flex-wrap gap-3 mt-2">
            <button
              type="submit"
              className="dispatch-btn"
              disabled={saving || uploading}
            >
              <i className="bi bi-arrow-right-circle-fill" aria-hidden />
              <span>
                {saving || uploading
                  ? "Saving…"
                  : form.id
                    ? "Save changes"
                    : "Publish work"}
              </span>
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={cancelForm}
              disabled={saving || uploading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {projects.length === 0 ? (
        <p className="small text-muted mb-0">No showcase items yet.</p>
      ) : (
        <div className="row g-3">
          {projects.map((project) => (
            <div key={project.id} className="col-md-6">
              <div className="portfolio-editor-item offering-block p-3 h-100">
                <div className="d-flex gap-3">
                  {project.cover_url ? (
                    <img
                      src={project.cover_url}
                      alt=""
                      className="portfolio-editor-item__thumb"
                    />
                  ) : (
                    <div className="portfolio-editor-item__thumb portfolio-editor-item__thumb--empty">
                      <i className="bi bi-image" aria-hidden />
                    </div>
                  )}
                  <div className="grow">
                    <strong className="d-block">{project.title}</strong>
                    {project.description ? (
                      <p className="small text-muted mb-2">
                        {project.description}
                      </p>
                    ) : null}
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => startEdit(project)}
                        disabled={deleting}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeProject(project.id)}
                        disabled={deleting}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
