import { User } from "./user.model";
import { Session } from "./session.model";
import { Email } from "./email.model";

User.hasMany(Session, {
  foreignKey: "userId",
  as: "sessions",
});

Session.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export { User, Session, Email };