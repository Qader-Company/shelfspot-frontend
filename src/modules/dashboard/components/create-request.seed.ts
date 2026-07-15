export interface CreateRequestStep {
  key: "location" | "service" | "guidelines";
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
  {
    key: "guidelines",
    titleKey: "createRequest.steps.guidelines",
    placeholderTitleKey: "createRequest.placeholders.guidelines.title",
    placeholderDescriptionKey: "createRequest.placeholders.guidelines.description",
  },
];
