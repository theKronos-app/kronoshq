import * as React from "react";
import { HTMLInputTypeAttribute } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = Readonly<{
  "data-test-id"?: string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
  type?: HTMLInputTypeAttribute;
}>;

export default function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
  "data-test-id": dataTestId,
  type = "text",
}: Props): JSX.Element {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor={dataTestId}>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        id={dataTestId}
        data-test-id={dataTestId}
      />
    </div>
  );
}
