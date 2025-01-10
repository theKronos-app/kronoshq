import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = Readonly<{
  "data-test-id"?: string;
  accept?: string;
  label: string;
  onChange: (files: FileList | null) => void;
}>;

export default function FileInput({
  accept,
  label,
  onChange,
  "data-test-id": dataTestId,
}: Props): JSX.Element {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor={dataTestId}>{label}</Label>
      <Input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files)}
        id={dataTestId}
        data-test-id={dataTestId}
      />
    </div>
  );
}
