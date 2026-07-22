import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import type { PaymentTransaction } from "./payments.seed";

interface PaymentsTableProps {
  rows: PaymentTransaction[];
  labels: {
    types: string;
    totalSpending: string;
    date: string;
    performedBy: string;
  };
}

export function PaymentsTable({
  rows,
  labels,
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
                {labels.performedBy}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row.id}-${index}`}
                className="text-sm"
              >
                <td className="border-b border-border px-5 py-4 text-muted-foreground">
                  {row.typeLabel}
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

                <td className="border-b border-border px-7 py-4 text-muted-foreground">
                  {row.performedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
