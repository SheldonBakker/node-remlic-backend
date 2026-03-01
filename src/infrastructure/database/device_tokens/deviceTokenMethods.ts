import type { IDeviceToken, IRegisterTokenData } from './types.js';
import db from '../databaseClient.js';
import { deviceTokens } from '../schema/index.js';
import { eq, and, inArray } from 'drizzle-orm';
import { HttpError } from '../../../shared/types/errors/appError.js';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus.js';

export async function registerToken(data: IRegisterTokenData): Promise<IDeviceToken> {
  const [row] = await db
    .insert(deviceTokens)
    .values({
      profile_id: data.profile_id,
      player_id: data.player_id,
    })
    .onConflictDoUpdate({
      target: [deviceTokens.profile_id, deviceTokens.player_id],
      set: { updated_at: new Date() },
    })
    .returning();

  if (!row) {
    throw new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to register device token');
  }

  return {
    id: row.id,
    profile_id: row.profile_id,
    player_id: row.player_id,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export async function deleteToken(profileId: string, playerId: string): Promise<void> {
  const existing = await db
    .select({ id: deviceTokens.id })
    .from(deviceTokens)
    .where(and(eq(deviceTokens.profile_id, profileId), eq(deviceTokens.player_id, playerId)))
    .then((rows) => rows.at(0));

  if (!existing) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Device token not found');
  }

  await db
    .delete(deviceTokens)
    .where(and(eq(deviceTokens.profile_id, profileId), eq(deviceTokens.player_id, playerId)));
}

export async function getPlayerIdsByProfileIds(profileIds: string[]): Promise<Map<string, string[]>> {
  if (profileIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({ profile_id: deviceTokens.profile_id, player_id: deviceTokens.player_id })
    .from(deviceTokens)
    .where(inArray(deviceTokens.profile_id, profileIds)) as Array<{ profile_id: string; player_id: string }>;

  const result = new Map<string, string[]>();
  for (const row of rows) {
    const existing = result.get(row.profile_id);
    if (existing) {
      existing.push(row.player_id);
    } else {
      result.set(row.profile_id, [row.player_id]);
    }
  }
  return result;
}
