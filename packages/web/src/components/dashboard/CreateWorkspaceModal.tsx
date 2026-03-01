import { Button, Input, Modal } from "@acme/components";
import { useEffect, useState } from "react";
import { useMessage } from "@/hooks/useMessage";
import { trpc } from "@/lib/trpc";
import type { Lang } from "@/lib/types";

interface CreateWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  onSuccess?: (workspace: { id: string; slug: string; name: string }) => void;
}

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function CreateWorkspaceModal({
  open,
  onClose,
  lang,
  onSuccess,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const utils = trpc.useUtils();
  const message = useMessage();

  const createMutation = trpc.workspace.create.useMutation({
    onSuccess: async (data) => {
      message.success(
        lang === "zh" ? "空间站创建成功" : "Workspace created successfully",
      );
      await utils.workspace.list.invalidate();
      reset();
      onSuccess?.(data);
    },
    onError: (err) => {
      message.error(
        err.message || (lang === "zh" ? "创建失败" : "Failed to create"),
      );
    },
  });

  const reset = () => {
    setName("");
    setSlug("");
    setSlugEdited(false);
    setDescription("");
  };

  useEffect(() => {
    if (!open) reset();
    // biome-ignore lint/correctness/useExhaustiveDependencies: reset is intentionally excluded to avoid infinite loop
  }, [open, reset]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugEdited) setSlug(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      name,
      slug: slug || undefined,
      description: description || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lang === "zh" ? "新建空间站" : "New Workspace"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={lang === "zh" ? "名称" : "Name"}
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          placeholder={lang === "zh" ? "我的空间站" : "My workspace"}
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          placeholder="my-workspace"
        />
        <Input
          label={lang === "zh" ? "描述（可选）" : "Description (optional)"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth type="button" onClick={onClose}>
            {lang === "zh" ? "取消" : "Cancel"}
          </Button>
          <Button
            variant="primary"
            fullWidth
            type="submit"
            loading={createMutation.isPending}
          >
            {lang === "zh" ? "创建" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
