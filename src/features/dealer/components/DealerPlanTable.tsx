import React from "react";
import { FlatList } from "react-native";

import DealerPlanRow from "./DealerPlanRow";

interface Props {
  rows: any[];
  dealers: any[];
  onChange: (
    index: number,
    field: string,
    value: any
  ) => void;
}

export default function DealerPlanTable({
  rows,
  dealers,
  onChange,
}: Props) {
  return (
    <FlatList
      scrollEnabled={false}
      data={rows}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => (
        <DealerPlanRow
          value={item}
          dealers={dealers}
          onChange={(field, value) =>
            onChange(index, field, value)
          }
        />
      )}
    />
  );
}