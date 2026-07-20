import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import { TrashIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

import type {
  PaymentTransaction,
  PaymentTransactionStatus,
  PaymentTransactionType,
} from "./payments.seed";

interface PaymentsTableProps {
  rows: PaymentTransaction[];
  labels: {
    types: string;
    totalSpending: string;
    date: string;
    status: string;
    action: string;
    delete: string;
  };
  resolveType: (typeKey: PaymentTransactionType) => string;
  resolveStatus: (status: PaymentTransactionStatus) => string;
}

export function PaymentsTable({
  rows,
  labels,
  resolveType,
  resolveStatus,
}: PaymentsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-start">
          <thead>
            <tr className="text-xs font-medium text-foreground">
              <th className="border-b border-e border-border px-5 py-3 text-start">
                {labels.types}
              </th>
              <th className="border-b border-e border-border px-7 py-3 text-start">
                {labels.totalSpending}
              </th>
              <th className="border-b border-e border-border px-7 py-3 text-start">
                {labels.date}
              </th>
              <th className="border-b border-e border-border px-7 py-3 text-start">
                {labels.status}
              </th>
              <th className="border-b border-border px-7 py-3 text-start">
                {labels.action}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row.id}-${row.status}-${index}`}
                className="text-sm"
              >
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {resolveType(row.typeKey)}
                </td>

                <td className="border-b border-border px-7 py-4">
                  <span
                    className={
                      row.direction === "credit"
                        ? "inline-flex items-center gap-1 font-medium text-success"
                        : "inline-flex items-center gap-1 font-medium text-destructive"
                    }
                  >
                    {row.amount}
                    {row.direction === "credit" ? (
                      <ArrowUpRight className="size-4 shrink-0" />
                    ) : (
                      <ArrowDownRight className="size-4 shrink-0" />
                    )}
                  </span>
                </td>

                <td className="border-b border-border px-7 py-4 text-muted-foreground">
                  {row.date}
                </td>

                <td className="border-b border-border px-7 py-4">
                  <StatusBadge
                    status={row.status}
                    label={resolveStatus(row.status)}
                  />
                </td>

                <td className="border-b border-border px-7 py-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={labels.delete}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
