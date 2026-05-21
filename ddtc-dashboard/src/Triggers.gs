/**
 * Installs and removes scheduled Apps Script triggers.
 */

/**
 * Installs the daily PM Dashboard sync trigger.
 * @return {void}
 */
function installDailySyncTrigger() {
  removeDailySyncTriggers();
  ScriptApp.newTrigger('runDailySync')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
}

/**
 * Removes daily PM Dashboard sync triggers.
 * @return {void}
 */
function removeDailySyncTriggers() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'runDailySync')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
}

/**
 * Schedules a one-time continuation trigger for the batched sync.
 * @return {void}
 */
function scheduleSyncContinuation() {
  removeSyncContinuationTriggers();
  ScriptApp.newTrigger('continueBatchedSync')
    .timeBased()
    .after(CONFIG.RESUME_DELAY_MS)
    .create();
}

/**
 * Removes pending continuation triggers for the batched sync.
 * @return {void}
 */
function removeSyncContinuationTriggers() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'continueBatchedSync')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
}
