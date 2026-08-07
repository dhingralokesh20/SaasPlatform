export function renderTemplate(
  template: string,
  variables: Record<string, any>,
) {
  return template.replace(
    /{{(.*?)}}/g,
    (_, key) => {
      const value = variables[key.trim()];

      return value !== undefined
        ? String(value)
        : "";
    },
  );
}