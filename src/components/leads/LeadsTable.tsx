import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Lead, LeadStage } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, isFollowUpOverdue, stageBadgeVariant } from "./utils";

interface LeadsTableProps {
  leads: Lead[];
  stages: LeadStage[];
  onOpenLead: (lead: Lead) => void;
  onMoveStage: (leadId: string, stage: LeadStage) => void;
}

export function LeadsTable({ leads, stages, onOpenLead, onMoveStage }: LeadsTableProps) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      const matchesSearch =
        !q ||
        l.businessName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q);
      const matchesStage = stageFilter === "all" || l.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [leads, search, stageFilter]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business or contact..."
            className="pl-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-25 text-left text-xs text-neutral-500">
              <th className="px-4 py-3 font-medium">Business Name</th>
              <th className="px-4 py-3 font-medium">Buyer Type</th>
              <th className="px-4 py-3 font-medium">Contact Person</th>
              <th className="px-4 py-3 font-medium">Required Qty</th>
              <th className="px-4 py-3 font-medium">Est. Monthly Value</th>
              <th className="px-4 py-3 font-medium">Last Interaction</th>
              <th className="px-4 py-3 font-medium">Next Follow-up</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => {
              const overdue = isFollowUpOverdue(lead.nextFollowUp);
              return (
                <tr
                  key={lead.id}
                  onClick={() => onOpenLead(lead)}
                  className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-25"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">{lead.businessName}</td>
                  <td className="px-4 py-3 text-neutral-600">{lead.buyerType}</td>
                  <td className="px-4 py-3 text-neutral-600">{lead.contactPerson}</td>
                  <td className="px-4 py-3 text-neutral-600">{lead.requiredQuantity} L/day</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatCurrency(lead.estimatedMonthlyValue)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{formatDate(lead.lastInteraction)}</td>
                  <td className={cn("px-4 py-3", overdue ? "font-medium text-red-600" : "text-neutral-600")}>
                    {formatDate(lead.nextFollowUp)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{lead.source}</td>
                  <td className="px-4 py-3">
                    <Badge variant={stageBadgeVariant[lead.stage]}>{lead.stage}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Move
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Move to...</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {stages.map((s) => (
                          <DropdownMenuItem
                            key={s}
                            disabled={s === lead.stage}
                            onClick={() => onMoveStage(lead.id, s)}
                          >
                            {s}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-neutral-400">
                  No leads match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
