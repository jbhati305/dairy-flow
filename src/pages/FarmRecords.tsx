import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Beef,
  FilterX,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { HealthBadge, LactationBadge } from "@/components/farm-records/badges";
import { AddAnimalDialog } from "@/components/farm-records/AddAnimalDialog";
import { EditAnimalDialog } from "@/components/farm-records/EditAnimalDialog";
import { AnimalDetailsDialog } from "@/components/farm-records/AnimalDetailsDialog";
import { allAnimals } from "@/data/animals";
import type { Animal, Breed, HealthStatus, LactationStatus } from "@/types";

const breeds: Breed[] = ["Gir", "Sahiwal", "Holstein Friesian", "Jersey", "Murrah Buffalo"];
const lactationStatuses: LactationStatus[] = ["Lactating", "Dry", "Pregnant", "Calf"];
const healthStatuses: HealthStatus[] = ["Healthy", "Under Observation", "Treatment Required"];

type SortField = "id" | "name" | "age" | "yield" | "nextCheckup";

const sortOptions: { value: SortField; label: string }[] = [
  { value: "id", label: "Animal ID" },
  { value: "name", label: "Name" },
  { value: "age", label: "Age" },
  { value: "yield", label: "Milk yield" },
  { value: "nextCheckup", label: "Next check-up" },
];

const PAGE_SIZE = 12;
const ALL_VALUE = "all";

export default function FarmRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [animals, setAnimals] = useState<Animal[]>(allAnimals);
  const [search, setSearch] = useState("");
  const [breedFilter, setBreedFilter] = useState<string>(ALL_VALUE);
  const [healthFilter, setHealthFilter] = useState<string>(ALL_VALUE);
  const [lactationFilter, setLactationFilter] = useState<string>(ALL_VALUE);
  const [sortBy, setSortBy] = useState<SortField>("id");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setAddOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = animals.filter((a) => {
      const matchesSearch = !q || a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
      const matchesBreed = breedFilter === ALL_VALUE || a.breed === breedFilter;
      const matchesHealth = healthFilter === ALL_VALUE || a.healthStatus === healthFilter;
      const matchesLactation = lactationFilter === ALL_VALUE || a.lactationStatus === lactationFilter;
      return matchesSearch && matchesBreed && matchesHealth && matchesLactation;
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "age":
          return b.ageYears - a.ageYears;
        case "yield":
          return b.currentMilkYield - a.currentMilkYield;
        case "nextCheckup":
          return a.nextCheckup.localeCompare(b.nextCheckup);
        default:
          return a.id.localeCompare(b.id);
      }
    });

    return list;
  }, [animals, search, breedFilter, healthFilter, lactationFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setBreedFilter(ALL_VALUE);
    setHealthFilter(ALL_VALUE);
    setLactationFilter(ALL_VALUE);
    setPage(1);
  };

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const nextId = useMemo(() => {
    const numericIds = animals
      .map((a) => Number(a.id.replace("DF-", "")))
      .filter((n) => !Number.isNaN(n));
    const max = numericIds.length > 0 ? Math.max(...numericIds) : 100;
    return `DF-${max + 1}`;
  }, [animals]);

  const handleAdd = (animal: Animal) => {
    setAnimals((prev) => [animal, ...prev]);
    setPage(1);
  };

  const handleUpdate = (updated: Animal) => {
    setAnimals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAnimal((prev) => (prev && prev.id === updated.id ? updated : prev));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-semibold text-neutral-900">Farm Records</h1>
          <p className="text-sm text-neutral-500">
            Manage cattle records, health history, and breeding information.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Animal
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by ID or name..."
                className="pl-8"
                aria-label="Search animals by ID or name"
              />
            </div>

            <Select value={breedFilter} onValueChange={handleFilterChange(setBreedFilter)}>
              <SelectTrigger className="w-[160px]" aria-label="Filter by breed">
                <SelectValue placeholder="Breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All breeds</SelectItem>
                {breeds.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={healthFilter} onValueChange={handleFilterChange(setHealthFilter)}>
              <SelectTrigger className="w-[180px]" aria-label="Filter by health status">
                <SelectValue placeholder="Health status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All health statuses</SelectItem>
                {healthStatuses.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={lactationFilter} onValueChange={handleFilterChange(setLactationFilter)}>
              <SelectTrigger className="w-[170px]" aria-label="Filter by lactation status">
                <SelectValue placeholder="Lactation status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All lactation statuses</SelectItem>
                {lactationStatuses.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
              <SelectTrigger className="w-[170px]" aria-label="Sort animals">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    Sort by {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(search || breedFilter !== ALL_VALUE || healthFilter !== ALL_VALUE || lactationFilter !== ALL_VALUE) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <FilterX className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>

          <p className="text-xs text-neutral-500">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} animals
          </p>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <Beef className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-neutral-900">No animals found</p>
              <p className="text-sm text-neutral-500">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                  <th className="px-4 py-3">Animal ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Breed</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Lactation status</th>
                  <th className="px-4 py-3">Current yield</th>
                  <th className="px-4 py-3">Health status</th>
                  <th className="px-4 py-3">Last vaccination</th>
                  <th className="px-4 py-3">Next check-up</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((animal) => (
                  <tr key={animal.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900 whitespace-nowrap">{animal.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback
                            style={{ backgroundColor: animal.photoColor }}
                            className="text-[10px] text-white"
                          >
                            {animal.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-neutral-900">{animal.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-700">{animal.breed}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-700">{animal.ageYears} yrs</td>
                    <td className="px-4 py-3">
                      <LactationBadge status={animal.lactationStatus} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-700">
                      {animal.currentMilkYield} L/day
                    </td>
                    <td className="px-4 py-3">
                      <HealthBadge status={animal.healthStatus} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-700">{animal.lastVaccination}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-700">{animal.nextCheckup}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAnimal(animal)}
                          aria-label={`View details for ${animal.name}`}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAnimal(animal)}
                          aria-label={`Edit details for ${animal.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
            <p className="text-xs text-neutral-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AddAnimalDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} nextId={nextId} />
      <AnimalDetailsDialog
        animal={selectedAnimal}
        onOpenChange={(open) => !open && setSelectedAnimal(null)}
        onEdit={(animal) => {
          setSelectedAnimal(null);
          setEditingAnimal(animal);
        }}
      />
      <EditAnimalDialog
        animal={editingAnimal}
        onOpenChange={(open) => !open && setEditingAnimal(null)}
        onSave={handleUpdate}
      />
    </div>
  );
}
