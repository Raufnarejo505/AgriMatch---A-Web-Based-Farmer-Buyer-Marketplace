"use client";

import { FormEvent, useState } from "react";

import { ApiError, api } from "@/lib/api";
import type { Requirement, RequirementInput } from "@/types";
import Button from "./Button";
import Input from "./Input";
import { ErrorMessage } from "./States";

type Props = {
  initial?: Requirement;
  onSaved: () => Promise<void> | void;
  onCancel: () => void;
};

export default function RequirementForm({ initial, onSaved, onCancel }: Props) {
  const [crop, setCrop] = useState(initial?.crop ?? "");
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : "");
  const [unit, setUnit] = useState(initial?.unit ?? "kg");
  const [minPrice, setMinPrice] = useState(initial ? String(initial.min_price) : "");
  const [maxPrice, setMaxPrice] = useState(initial ? String(initial.max_price) : "");
  const [deliveryArea, setDeliveryArea] = useState(initial?.delivery_area ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (Number(maxPrice) < Number(minPrice)) {
      setError("Max price must be greater than or equal to min price");
      return;
    }
    setSaving(true);
    const payload: RequirementInput = {
      crop: crop.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      min_price: Number(minPrice),
      max_price: Number(maxPrice),
      delivery_area: deliveryArea.trim(),
    };
    try {
      if (initial) await api.patch(`/api/requirements/${initial.id}`, payload);
      else await api.post("/api/requirements", payload);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save requirement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Crop" name="crop" required minLength={2} value={crop} onChange={(e) => setCrop(e.target.value)} />
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          required
          min="0.01"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Input label="Unit" name="unit" required value={unit} onChange={(e) => setUnit(e.target.value)} />
        <Input
          label="Min price"
          name="min_price"
          type="number"
          required
          min="0"
          step="any"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <Input
          label="Max price"
          name="max_price"
          type="number"
          required
          min="0.01"
          step="any"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <Input
          label="Delivery area"
          name="delivery_area"
          required
          minLength={2}
          value={deliveryArea}
          onChange={(e) => setDeliveryArea(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Create requirement"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
