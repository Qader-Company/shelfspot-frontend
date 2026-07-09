export type NotificationTone = "info" | "danger" | "success" | "purple";

export interface DashboardNotificationItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  timeKey: string;
  tone: NotificationTone;
}

export const dashboardNotifications: DashboardNotificationItem[] = [
  {
    id: "new-hiring-request",
    titleKey: "items.newHiringRequest.title",
    descriptionKey: "items.newHiringRequest.description",
    timeKey: "items.newHiringRequest.time",
    tone: "info",
  },
  {
    id: "assignment-rejected",
    titleKey: "items.assignmentRejected.title",
    descriptionKey: "items.assignmentRejected.description",
    timeKey: "items.assignmentRejected.time",
    tone: "danger",
  },
  {
    id: "freelancer-assigned",
    titleKey: "items.freelancerAssigned.title",
    descriptionKey: "items.freelancerAssigned.description",
    timeKey: "items.freelancerAssigned.time",
    tone: "success",
  },
  {
    id: "wallet-credited",
    titleKey: "items.walletCredited.title",
    descriptionKey: "items.walletCredited.description",
    timeKey: "items.walletCredited.time",
    tone: "purple",
  },
];
