"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Save, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fileToAvatarDataUrl } from "@/lib/image";
import type { UserProgress } from "@/lib/types";
import { useUpdateProgress } from "@/hooks/use-progress";

const MAX_NAME = 50;
const MAX_BIO = 280;

interface ProfileSectionProps {
  progress: UserProgress;
}

export function ProfileSection({ progress }: ProfileSectionProps) {
  const update = useUpdateProgress();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Đồng bộ state form với dữ liệu server khi tải xong / thay đổi
  useEffect(() => {
    setDisplayName(progress.displayName ?? "");
    setBio(progress.bio ?? "");
    setAvatarUrl(progress.avatarUrl ?? null);
  }, [progress.displayName, progress.bio, progress.avatarUrl]);

  const nameValid = displayName.length <= MAX_NAME;
  const bioValid = bio.length <= MAX_BIO;
  const hasChanges =
    displayName !== (progress.displayName ?? "") ||
    bio !== (progress.bio ?? "") ||
    avatarUrl !== (progress.avatarUrl ?? null);

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset để chọn lại cùng file vẫn kích hoạt
    if (!file) return;
    setProcessing(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi xử lý ảnh");
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!nameValid || !bioValid) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }
    try {
      await update.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl ?? "",
      });
      toast.success("Đã cập nhật hồ sơ 🎉");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi lưu hồ sơ");
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Hồ sơ</h2>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar
              src={avatarUrl}
              name={displayName || "Bạn"}
              className="h-24 w-24"
              size={32}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={processing}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:opacity-60"
              aria-label="Đổi ảnh đại diện"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
          {avatarUrl ? (
            <button
              type="button"
              onClick={() => setAvatarUrl(null)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Xoá ảnh
            </button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePickFile}
          />
        </div>

        {/* Thông tin */}
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="displayName" className="mb-1.5 block text-sm">
              Tên hiển thị
            </Label>
            <Input
              id="displayName"
              value={displayName}
              maxLength={MAX_NAME + 10}
              placeholder="Nhập tên của bạn"
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p
              className={`mt-1.5 text-xs ${
                nameValid ? "text-muted-foreground" : "text-destructive"
              }`}
            >
              {displayName.length}/{MAX_NAME} ký tự
            </p>
          </div>

          <div>
            <Label htmlFor="bio" className="mb-1.5 block text-sm">
              Giới thiệu
            </Label>
            <Textarea
              id="bio"
              value={bio}
              placeholder="Vài dòng về mục tiêu học của bạn..."
              onChange={(e) => setBio(e.target.value)}
            />
            <p
              className={`mt-1.5 text-xs ${
                bioValid ? "text-muted-foreground" : "text-destructive"
              }`}
            >
              {bio.length}/{MAX_BIO} ký tự
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || !nameValid || !bioValid || update.isPending}
            >
              {update.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Lưu hồ sơ
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
