export function renderTemplate(
  template: string,
  mappings: Record<string, any>
): string {
  let output = template;

  for (const key of Object.keys(mappings)) {
    const value = mappings[key];

    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");

    output = output.replace(regex, String(value));
  }

  return output;
}