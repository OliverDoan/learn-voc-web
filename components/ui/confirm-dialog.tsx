"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
}

interface UseConfirmResult {
  /** Mở popup xác nhận, trả về Promise<boolean> (true nếu người dùng đồng ý). */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Render node này trong JSX của component để popup hoạt động. */
  confirmDialog: React.ReactNode;
}

/**
 * Hook hiển thị popup xác nhận đẹp (khớp dark mode) thay cho `window.confirm()`.
 *
 * Cách dùng:
 * const { confirm, confirmDialog } = useConfirm();
 * if (await confirm({ title: "Xoá từ này?" })) { ... }
 * return <>...{confirmDialog}</>;
 */
export function useConfirm(): UseConfirmResult {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<((result: boolean) => void) | null>(null);

  const confirm = React.useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleResolve = React.useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const variant = options?.variant ?? "destructive";

  const confirmDialog = (
    <Dialog
      open={options !== null}
      onOpenChange={(open) => {
        if (!open) handleResolve(false);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {variant === "destructive" ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            ) : null}
            <div className="flex flex-col space-y-1.5">
              <DialogTitle>{options?.title}</DialogTitle>
              {options?.description ? (
                <DialogDescription>{options.description}</DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleResolve(false)}>
            {options?.cancelText ?? "Huỷ"}
          </Button>
          <Button variant={variant} onClick={() => handleResolve(true)}>
            {options?.confirmText ?? "Xoá"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, confirmDialog };
}
