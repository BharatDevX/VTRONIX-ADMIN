import React from "react";
import AppInput from "../ui/AppInput";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export default function ReportSearchBar({
  value,
  onChangeText,
}: Props) {
  return (
    <AppInput
      label="Search"
      placeholder="Search..."
      value={value}
      onChangeText={onChangeText}
    />
  );
}