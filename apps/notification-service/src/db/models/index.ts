import { EmailLog } from "./email-log.model";
import { EmailTemplate } from "./email-template.model";
import { Email } from "./email.model";


Email.hasMany(EmailLog,{
  foreignKey:"emailId",
  as:"logs"
});

EmailLog.belongsTo(Email,{
  foreignKey:"emailId",
  as:"email"
});


export {
  Email,
  EmailTemplate,
  EmailLog
};