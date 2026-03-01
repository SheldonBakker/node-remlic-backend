/* eslint-disable no-await-in-loop */
import type { IJobResult, IJobError } from '../types.js';
import { CronService } from '../cronService.js';
import Logger from '../../shared/utils/logger.js';
import { getExpiringRemindersBatch } from '../../infrastructure/database/reminders/remindersMethods.js';
import { getPlayerIdsByProfileIds } from '../../infrastructure/database/device_tokens/deviceTokenMethods.js';
import { getProfileIdsWithValidSubscription } from '../../infrastructure/database/subscriptions/subscriptionsMethods.js';
import { PushService } from '../../infrastructure/push/pushService.js';

const JOB_NAME = 'push-reminders';
const SCHEDULE = '0 8 * * *';
const TIMEZONE = 'Africa/Johannesburg';
const BATCH_SIZE = 1000;

async function run(): Promise<IJobResult> {
  const startTime = new Date();
  const errors: IJobError[] = [];
  let recordsProcessed = 0;
  let pushSent = 0;
  let cursor: string | null = null;

  try {
    let hasMore = true;

    while (hasMore) {
      const { items, nextCursor } = await getExpiringRemindersBatch(BATCH_SIZE, cursor);

      if (items.length === 0) {
        break;
      }

      const profileIds = [...new Set(items.map((item) => item.profileId))];
      const playerIdsMap = await getPlayerIdsByProfileIds(profileIds);
      const validProfileIds = await getProfileIdsWithValidSubscription(profileIds);

      for (const item of items) {
        recordsProcessed++;
        if (!validProfileIds.has(item.profileId)) {
          continue;
        }
        const playerIds = playerIdsMap.get(item.profileId);
        if (!playerIds || playerIds.length === 0) {
          continue;
        }

        const result = await PushService.send({
          playerIds,
          title: 'Expiry Reminder',
          body: `${item.itemName} expires in ${item.daysUntilExpiry} day(s)`,
          data: {
            entityType: item.entityType,
            entityId: item.entityId,
            expiryDate: item.expiryDate,
          },
        });

        if (result.success) {
          pushSent++;
        } else {
          errors.push({ recordId: item.entityId, message: result.error ?? 'Push send failed' });
          Logger.error(JOB_NAME, `Failed to send push for ${item.entityId}: ${result.error}`);
        }
      }

      hasMore = nextCursor !== null;
      cursor = nextCursor;
    }

    return {
      jobName: JOB_NAME,
      startTime,
      endTime: new Date(),
      success: errors.length === 0,
      recordsProcessed,
      recordsUpdated: pushSent,
      errors,
    };
  } catch (error) {
    Logger.error(JOB_NAME, 'Push reminder job failed', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      jobName: JOB_NAME,
      startTime,
      endTime: new Date(),
      success: false,
      recordsProcessed,
      recordsUpdated: pushSent,
      errors: [{ recordId: '', message }],
    };
  }
}

export function registerPushReminderJob(): void {
  CronService.register({
    name: JOB_NAME,
    schedule: SCHEDULE,
    timezone: TIMEZONE,
    handler: async () => {
      await run();
    },
  });
}
