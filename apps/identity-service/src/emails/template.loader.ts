import fs from "fs";
import path from "path";
import { EmailType } from "../constants/emailConstants";
import { EmailTemplateMap } from "./template.registery";

export class TemplateLoader {
  private templateCache: Map<string, string> = new Map();

  loadTemplate(type: EmailType): string {
    const fileName = EmailTemplateMap[type];

    if (!fileName) {
      throw new Error(`No template mapped for type: ${type}`);
    }

    const filePath = path.join(__dirname, "templates", fileName);

    if (this.templateCache.has(filePath)) {
      return this.templateCache.get(filePath)!;
    }

    const template = fs.readFileSync(filePath, "utf-8");

    this.templateCache.set(filePath, template);

    return template;
  }
}
