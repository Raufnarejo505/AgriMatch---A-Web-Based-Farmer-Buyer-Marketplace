"use client";

import type { SearchFilters } from "@/lib/filters";
import Button from "./Button";
import Card from "./Card";
import Input from "./Input";
import Select from "./Select";

type Props = {
  values: SearchFilters;
  onChange: (values: SearchFilters) => void;
  onApply: () => void;
  onReset: () => void;
  locationLabel?: string;
  showQuality?: boolean;
};

export default function FilterBar({
  values,
  onChange,
  onApply,
  onReset,
  locationLabel = "Location",
  showQuality = false,
}: Props) {
  function update(field: keyof SearchFilters, value: string) {
    onChange({ ...values, [field]: value });
  }

  return (
    <Card>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onApply();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Crop" name="crop" value={values.crop} onChange={(event) => update("crop", event.target.value)} />
          <Input
            label={locationLabel}
            name="location"
            value={values.location}
            onChange={(event) => update("location", event.target.value)}
          />
          {showQuality && (
            <Select
              label="Quality"
              name="quality"
              value={values.quality}
              onChange={(event) => update("quality", event.target.value)}
            >
              <option value="">Any quality</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </Select>
          )}
          <Input
            label="Min quantity"
            name="min_quantity"
            type="number"
            min="0"
            step="any"
            value={values.min_quantity}
            onChange={(event) => update("min_quantity", event.target.value)}
          />
          <Input
            label="Max quantity"
            name="max_quantity"
            type="number"
            min="0"
            step="any"
            value={values.max_quantity}
            onChange={(event) => update("max_quantity", event.target.value)}
          />
          <Input
            label="Min price"
            name="min_price"
            type="number"
            min="0"
            step="any"
            value={values.min_price}
            onChange={(event) => update("min_price", event.target.value)}
          />
          <Input
            label="Max price"
            name="max_price"
            type="number"
            min="0"
            step="any"
            value={values.max_price}
            onChange={(event) => update("max_price", event.target.value)}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="submit">Apply filters</Button>
          <Button type="button" variant="secondary" onClick={onReset}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}
