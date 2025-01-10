import * as React from "react";
import { ReactNode } from "react";
import { DialogFooter } from "@/components/ui/dialog";

type Props = Readonly<{
  "data-test-id"?: string;
  children: ReactNode;
}>;

export function DialogButtonsList({ children }: Props): JSX.Element {
  return <div className="flex space-x-2">{children}</div>;
}

export function DialogActions({
  "data-test-id": dataTestId,
  children,
}: Props): JSX.Element {
  return <DialogFooter data-test-id={dataTestId}>{children}</DialogFooter>;
}
