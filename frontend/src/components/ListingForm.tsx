"use client";

import { FormEvent, useState } from "react";

import { ApiError, api } from "@/lib/api";
import type { Listing, ListingInput, Quality } from "@/types";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import { ErrorMessage } from "./States";

type Props = {
  initial?: Listing;
  onSaved: () => Promise<void> | void;
  onCancel: () => void;
};

export default function ListingForm({ initial, onSaved, onCancel }: Props) {
  const [crop, setCrop] = useState(initial?.crop ?? "");
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : "");
  const [unit, setUnit] = useState(initial?.unit ?? "kg");
  const [quality, setQuality] = useState<Quality>(initial?.quality ?? "A");
  const [price, setPrice] = useState(initial ? String(initial.price_per_unit) : "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const payload: ListingInput = {
      crop: crop.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      quality,
      price_per_unit: Number(price),
      location: location.trim(),
      description: description.trim() || null,
    };
    try {
      if (initial) await api.patch(`/api/listings/${initial.id}`, payload);
      else await api.post("/api/listings", payload);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save listing");
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
        <Select label="Quality" name="quality" value={quality} onChange={(e) => setQuality(e.target.value as Quality)}>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
        </Select>
        <Input
          label="Price per unit"
          name="price_per_unit"
          type="number"
          required
          min="0.01"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          label="Location"
          name="location"
          required
          minLength={2}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Create listing"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
