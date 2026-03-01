import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownItem,
} from "@acme/components";
import type { User } from "@acme/types";
import { useState } from "react";
import type { Lang } from "@/lib/types";
import ProfileSettingsModal from "./ProfileSettingsModal";

type UserMenuProps = {
  user: User;
  lang: Lang;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
};

export default function UserMenu({
  user,
  lang,
  onUpdateUser,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const displayName = user.name || user.email;

  const trigger = (
    <button
      type="button"
      className="cursor-pointer w-full flex items-center gap-2 rounded px-2 py-1.5 text-sm text-[var(--ui-text)] hover:bg-[var(--ui-sidebar-item-hover)] transition-colors"
    >
      <Avatar
        name={user.name}
        email={user.email}
        url={user.settings?.avatarUrl}
        size="sm"
      />
      <span className="flex-1 text-left truncate font-medium">
        {displayName}
      </span>
    </button>
  );

  return (
    <>
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        align="right"
      >
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-[var(--ui-text)] truncate">
            {displayName}
          </p>
          <p className="text-xs text-[var(--ui-text-muted)] truncate">
            {user.email}
          </p>
        </div>
        <DropdownDivider />
        <DropdownItem
          onClick={() => {
            setOpen(false);
            setSettingsOpen(true);
          }}
        >
          {lang === "zh" ? "个人设置" : "Profile settings"}
        </DropdownItem>
        <DropdownItem
          danger
          onClick={() => {
            setOpen(false);
            onLogout();
          }}
        >
          {lang === "zh" ? "退出登录" : "Sign out"}
        </DropdownItem>
      </Dropdown>

      <ProfileSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        lang={lang}
        onUpdateUser={onUpdateUser}
      />
    </>
  );
}
