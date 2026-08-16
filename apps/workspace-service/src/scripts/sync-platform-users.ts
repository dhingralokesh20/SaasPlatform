import { QueryTypes } from "sequelize";

import { identitySequelize } from "./identity-db";
import { sequelize as workspaceSequelize } from "../db/sequelize";
import { PlatformUser } from "../db/models/platform-user.model";
import "../config/env.config";

interface IdentityUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

const syncPlatformUsers = async () => {
  console.log("Starting platform user projection sync...");

  try {
    await identitySequelize.authenticate();
    await workspaceSequelize.authenticate();

    console.log("Database connections established.");

    const users = await identitySequelize.query<IdentityUser>(
      `
        SELECT
          id,
          email,
          "firstName",
          "lastName",
          status
        FROM users
      `,
      {
        type: QueryTypes.SELECT,
      },
    );

    console.log(`Found ${users.length} users in Identity DB.`);

    const platformUsers = users.map((user) => ({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: null,
      status: user.status,
    }));

    if (platformUsers.length > 0) {
      await PlatformUser.bulkCreate(platformUsers, {
        updateOnDuplicate: [
          "email",
          "firstName",
          "lastName",
          "profilePic",
          "status",
          "updatedAt",
        ],
      });
    }

    console.log(
      `Successfully synchronized ${platformUsers.length} platform users.`,
    );
  } catch (error) {
    console.error("Platform user projection sync failed:", error);

    process.exitCode = 1;
  } finally {
    await identitySequelize.close();
    await workspaceSequelize.close();

    console.log("Database connections closed.");
  }
};

syncPlatformUsers();