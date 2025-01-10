import * as React from "react";
import { Switch as ShadcnSwitch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Switch({
  checked,
  onClick,
  text,
  id,
}: Readonly<{
  checked: boolean;
  id?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  text: string;
}>): JSX.Element {
  return (
    <div className="flex items-center space-x-2" id={id}>
      <ShadcnSwitch
        checked={checked}
        onCheckedChange={(checked) => onClick({ checked } as any)}
        id={id || undefined}
      />
      <Label htmlFor={id || undefined}>{text}</Label>
    </div>
  );
}
