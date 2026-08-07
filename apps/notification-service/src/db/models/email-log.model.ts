import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "../sequelize";


export class EmailLog extends Model<
  InferAttributes<EmailLog>,
  InferCreationAttributes<EmailLog>
>{

  declare id: CreationOptional<string>;

  declare emailId:string;

  declare status:string;

  declare message:string | null;

  declare providerResponse:object | null;

  declare createdAt:CreationOptional<Date>;
}


EmailLog.init(
{
  id:{
    type:DataTypes.UUID,
    defaultValue:DataTypes.UUIDV4,
    primaryKey:true,
  },

  emailId:{
    type:DataTypes.UUID,
    allowNull:false,
  },

  status:{
    type:DataTypes.STRING,
    allowNull:false,
  },

  message:{
    type:DataTypes.TEXT,
    allowNull:true,
  },

  providerResponse:{
    type:DataTypes.JSON,
    allowNull:true,
  },

  createdAt:{
    type:DataTypes.DATE,
    defaultValue:DataTypes.NOW,
  }

},
{
  sequelize,
  tableName:"email_logs",
  timestamps:false,
}
)