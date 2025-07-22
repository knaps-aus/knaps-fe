import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { DistributorRead, BrandRead } from "@shared/schema";

interface CTCLevel {
  id: number;
  name: string;
  types?: CTCLevel[];
  categories?: CTCLevel[];
}

export interface FilterValues {
  distributor_id?: number;
  brand_id?: number;
  class_id?: number;
  type_id?: number;
  category_id?: number;
}

interface FiltersProps {
  onSubmit: (values: FilterValues) => void;
}

export default function Filters({ onSubmit }: FiltersProps) {
  const [distributor, setDistributor] = useState("");
  const [brand, setBrand] = useState("");
  const [classId, setClassId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: distributors = [] } = useQuery<DistributorRead[]>({
    queryKey: ["/distributors"],
  });

  const { data: brands = [] } = useQuery<BrandRead[]>({
    queryKey: ["/brands/distributor", distributor],
    queryFn: async () => {
      if (!distributor) return [];
      const res = await apiRequest("GET", `/brands/distributor/${distributor}`);
      return res.json();
    },
    enabled: !!distributor,
  });

  const { data: hierarchy = [] } = useQuery<CTCLevel[]>({
    queryKey: ["/ctc/hierarchy"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/ctc/hierarchy");
      return res.json();
    },
  });

  useEffect(() => {
    setBrand("");
  }, [distributor]);

  useEffect(() => {
    setTypeId("");
    setCategoryId("");
  }, [classId]);

  useEffect(() => {
    setCategoryId("");
  }, [typeId]);

  const selectedClass = hierarchy.find((c) => String(c.id) === classId);
  const typeOptions = selectedClass?.types || [];
  const selectedType = typeOptions.find((t) => String(t.id) === typeId);
  const categoryOptions = selectedType?.categories || [];

  const handleSubmit = () => {
    const values: FilterValues = {};
    if (distributor) values.distributor_id = Number(distributor);
    if (brand) values.brand_id = Number(brand);
    if (classId) values.class_id = Number(classId);
    if (typeId) values.type_id = Number(typeId);
    if (categoryId) values.category_id = Number(categoryId);
    onSubmit(values);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
      <Select value={brand} onValueChange={setBrand} disabled={!brands.length}>
        <SelectTrigger>
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          {brands.map((b) => (
            <SelectItem key={b.id} value={String(b.id)}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={distributor} onValueChange={setDistributor}>
        <SelectTrigger>
          <SelectValue placeholder="Distributor" />
        </SelectTrigger>
        <SelectContent>
          {distributors.map((d) => (
            <SelectItem key={d.id} value={String(d.id)}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={classId} onValueChange={setClassId}>
        <SelectTrigger>
          <SelectValue placeholder="Class" />
        </SelectTrigger>
        <SelectContent>
          {hierarchy.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={typeId} onValueChange={setTypeId} disabled={!typeOptions.length}>
        <SelectTrigger>
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map((t) => (
            <SelectItem key={t.id} value={String(t.id)}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={setCategoryId} disabled={!categoryOptions.length}>
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categoryOptions.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="md:col-span-5 flex justify-end">
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
}
