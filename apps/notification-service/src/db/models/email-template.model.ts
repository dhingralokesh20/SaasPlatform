import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "../sequelize";


export class EmailTemplate extends Model<
  InferAttributes<EmailTemplate>,
  InferCreationAttributes<EmailTemplate>
> {

  declare id: CreationOptional<string>;

  declare name: string;

  declare subject: string;

  declare body: string;

  declare variables: object;

  declare isActive: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}


EmailTemplate.init(
  {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:true,
    },

    name:{
      type:DataTypes.STRING,
      allowNull:false,
      unique:true,
    },

    subject:{
      type:DataTypes.STRING,
      allowNull:false,
    },

    body:{
      type:DataTypes.TEXT,
      allowNull:false,
    },

    variables:{
      type:DataTypes.JSON,
      allowNull:false,
    },

    isActive:{
      type:DataTypes.BOOLEAN,
      defaultValue:true,
    },

    createdAt:{
      type:DataTypes.DATE,
      defaultValue:DataTypes.NOW,
    },

    updatedAt:{
      type:DataTypes.DATE,
      defaultValue:DataTypes.NOW,
    }
  },
  {
    sequelize,
    tableName:"email_templates",
    timestamps:true,
  }
);