import React from "react";
import AppDatePicker from "../ui/AppDatePicker";

interface Props {
  value: string;
  onChange: (date: string) => void;
}

export default function ReportDateFilter({
  value,
  onChange,
}: Props) {
  return (
    <AppDatePicker
      label="Filter Date"
      value={value}
      onChange={onChange}
    />
  );
}