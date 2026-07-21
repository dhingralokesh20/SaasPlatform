import { randomUUID } from "crypto";
import { LoginState } from "./LoginState";
import { LoginChallenge } from "../../types/LoginChallenge";
import { LoginChallengeKey } from "../../../utils/redisKeys";
import { redis } from "../../../redis";
import { AppError } from "../../../errors/AppError";
import { LoginChallengeExpiredError } from "../../../errors/ErrorConfig";

const LOGIN_CHALLENGE_EXPIRY = 5 * 60; // 5 minutes

export class LoginChallengeService {
  async create(params: {
    userId: string;
    email: string;
    rememberMe: boolean;
    state: LoginState;
  }): Promise<{ challengeId: string }> {
    const challengeId = randomUUID();

    const challenge: LoginChallenge = {
      userId: params.userId,
      email: params.email,
      state: params.state,
      rememberMe: params.rememberMe,
    };

    await redis.set(
      LoginChallengeKey(challengeId),
      JSON.stringify(challenge),
      "EX",
      LOGIN_CHALLENGE_EXPIRY,
    );

    return {
      challengeId,
    };
  }

  async get(id: string): Promise<LoginChallenge> {
    const raw = await redis.get(LoginChallengeKey(id));

    if (!raw) {
      throw new AppError(LoginChallengeExpiredError);
    }

    return JSON.parse(raw) as LoginChallenge;
  }

  async delete(challengeId: string): Promise<void> {
    await redis.del(LoginChallengeKey(challengeId));
  }
}
