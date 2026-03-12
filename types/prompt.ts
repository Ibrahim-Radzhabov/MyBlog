export type PromptStatus = "draft" | "published";
export type PromptVisibility = "public" | "hidden";

export type PromptVariableType = "text" | "number" | "select" | "boolean";

export type PromptVariable = {
  name: string;
  label: string;
  type: PromptVariableType;
  required: boolean;
  placeholder?: string;
  options?: string[];
};
