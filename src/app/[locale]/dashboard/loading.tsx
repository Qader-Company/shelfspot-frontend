import { PageLoadingSkeleton } from "@/shared/components/feedback";

export default function DashboardLoading() {
  return (
    <PageLoadingSkeleton
      actionCount={1}
      cardCount={4}
      chartCount={1}
      tableRows={6}
      tableColumns={5}
    />
  );
}
