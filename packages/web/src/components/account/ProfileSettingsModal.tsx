import { Avatar, Button, Input, Modal, Select } from "@acme/components";
import type { User } from "@acme/types";
import { useEffect, useRef, useState } from "react";
import { useMessage } from "../../hooks/useMessage";
import { trpc } from "../../lib/trpc";
import type { Lang } from "../../lib/types";

interface ProfileSettingsModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  lang: Lang;
  onUpdateUser: (user: User) => void;
}

export default function ProfileSettingsModal({
  open,
  onClose,
  user,
  lang,
  onUpdateUser,
}: ProfileSettingsModalProps) {
  const message = useMessage();
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.settings?.avatarUrl ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [langMode, setLangMode] = useState<"auto" | "zh" | "en">(
    user.settings?.langMode ?? "auto",
  );
  const [themeMode, setThemeMode] = useState<"auto" | "light" | "dark">(
    user.settings?.themeMode ?? "auto",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form when user prop changes or modal opens
  useEffect(() => {
    if (open) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setAvatarUrl(user.settings?.avatarUrl ?? "");
      setLangMode(user.settings?.langMode ?? "auto");
      setThemeMode(user.settings?.themeMode ?? "auto");
    }
  }, [open, user]);

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: (updated) => {
      onUpdateUser(updated);
      message.success(lang === "zh" ? "保存成功" : "Saved successfully");
      onClose();
    },
    onError: (err) => {
      message.error(
        err.message || (lang === "zh" ? "保存失败" : "Failed to save"),
      );
    },
  });

  const deleteAvatarMutation = trpc.user.deleteAvatar.useMutation({
    onSuccess: (updated) => {
      setAvatarUrl("");
      onUpdateUser(updated);
      message.success(lang === "zh" ? "头像已删除" : "Avatar removed");
    },
    onError: (err) => {
      message.error(
        err.message || (lang === "zh" ? "删除失败" : "Failed to remove avatar"),
      );
    },
  });

  /** Upload avatar file directly to the storage backend via /upload/avatar. */
  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected if needed
    e.target.value = "";

    setAvatarUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/upload/avatar", {
        method: "POST",
        body,
        credentials: "include",
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          data.error ?? (lang === "zh" ? "上传失败" : "Upload failed"),
        );
      }

      const data = (await res.json()) as { url: string; user: User };
      setAvatarUrl(data.url);
      onUpdateUser(data.user);
      message.success(lang === "zh" ? "头像已更新" : "Avatar updated");
    } catch (err) {
      message.error(
        err instanceof Error
          ? err.message
          : lang === "zh"
            ? "上传失败"
            : "Upload failed",
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      // Avatar is managed separately via /upload/avatar; only send lang/theme here
      settings: { langMode, themeMode },
    });
  };

  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("个人设置", "Profile Settings")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <Avatar
            name={name || user.name}
            email={email || user.email}
            url={avatarUrl || undefined}
            size="lg"
          />
          <div className="flex flex-col gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <Button
              type="button"
              variant="secondary"
              loading={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {t("上传头像", "Upload photo")}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                loading={deleteAvatarMutation.isPending}
                onClick={() => deleteAvatarMutation.mutate()}
              >
                {t("删除头像", "Remove photo")}
              </Button>
            )}
          </div>
        </div>

        <Input
          label={t("姓名", "Name")}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label={t("邮箱", "Email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Select
          label={t("语言", "Language")}
          value={langMode}
          onChange={(e) => setLangMode(e.target.value as "auto" | "zh" | "en")}
        >
          <option value="auto">{t("跟随系统", "Follow system")}</option>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </Select>

        <Select
          label={t("主题", "Theme")}
          value={themeMode}
          onChange={(e) =>
            setThemeMode(e.target.value as "auto" | "light" | "dark")
          }
        >
          <option value="auto">{t("跟随系统", "Follow system")}</option>
          <option value="light">{t("浅色", "Light")}</option>
          <option value="dark">{t("深色", "Dark")}</option>
        </Select>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("取消", "Cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={updateMutation.isPending}
          >
            {t("保存", "Save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
