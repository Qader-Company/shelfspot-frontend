export interface CreateRequestStep {
  key: "location" | "service";
  titleKey: string;
  placeholderTitleKey: string;
  placeholderDescriptionKey: string;
}

export const createRequestSteps: CreateRequestStep[] = [
  {
    key: "location",
    titleKey: "createRequest.steps.location",
    placeholderTitleKey: "createRequest.placeholders.location.title",
    placeholderDescriptionKey: "createRequest.placeholders.location.description",
  },
  {
    key: "service",
    titleKey: "createRequest.steps.service",
    placeholderTitleKey: "createRequest.placeholders.service.title",
    placeholderDescriptionKey: "createRequest.placeholders.service.description",
  },
];
