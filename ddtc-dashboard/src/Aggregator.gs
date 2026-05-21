/**
 * Batched sync engine for reading DDC workbooks and writing PM Dashboard data.
 */

/**
 * Runs a no-op batched sync across registered DDC workbook IDs.
 * @return {void}
 */
function runBatchedSync() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10 * 1000)) {
    writeSyncLog({
      status: 'locked',
      message: 'Another sync invocation is already running.'
    });
    return;
  }

  const startedAt = Date.now();
  const properties = PropertiesService.getScriptProperties();
  const existingRunId = properties.getProperty(CONFIG.SYNC_RUN_ID_PROPERTY);
  const runId = existingRunId || createRunId();
  let cursor = Number(properties.getProperty(CONFIG.SYNC_CURSOR_PROPERTY) || 0);
  let processedCount = 0;
  let errorCount = 0;
  const useRealSync = Boolean(CONFIG.DEALER_REGISTRY_SHEET_ID && CONFIG.PM_DASHBOARD_ID);
  const profileActivityRows = [];
  const meetingScheduleRows = [];
  const idaRows = [];

  try {
    if (!existingRunId) {
      properties.setProperty(CONFIG.SYNC_RUN_ID_PROPERTY, runId);
    }

    const registryRows = getActiveWorkbookRegistryRows();
    const batchLimit = Math.min(cursor + CONFIG.BATCH_SIZE, registryRows.length);

    if (useRealSync && cursor === 0) {
      clearDashboardData();
    }

    for (let index = cursor; index < batchLimit; index += 1) {
      if (Date.now() - startedAt > CONFIG.MAX_RUN_MS) {
        break;
      }

      const registryRow = registryRows[index];
      try {
        if (useRealSync) {
          const workbookData = processWorkbookData_(registryRow);
          profileActivityRows.push(workbookData.profileActivityRow);
          meetingScheduleRows.push(workbookData.meetingScheduleRow);
          idaRows.push(workbookData.idaRow);
        } else {
          processWorkbookNoop_(registryRow, index, runId);
        }
        processedCount += 1;
        cursor = index + 1;
      } catch (error) {
        errorCount += 1;
        cursor = index + 1;
        writeWorkbookError(runId, registryRow.workbookId, error);
      }
    }

    if (useRealSync) {
      writeProfileActivityRows(profileActivityRows);
      writeMeetingScheduleRows(meetingScheduleRows);
      writeIdaRows(idaRows);
    }

    const durationMs = Date.now() - startedAt;
    if (cursor < registryRows.length) {
      properties.setProperty(CONFIG.SYNC_CURSOR_PROPERTY, String(cursor));
      scheduleSyncContinuation();
      writeSyncLog({
        runId,
        status: 'partial',
        processedCount,
        errorCount,
        durationMs,
        cursor,
        message: `Processed through ${cursor} of ${registryRows.length}; continuation scheduled.`
      });
      return;
    }

    properties.deleteProperty(CONFIG.SYNC_CURSOR_PROPERTY);
    properties.deleteProperty(CONFIG.SYNC_RUN_ID_PROPERTY);
    removeSyncContinuationTriggers();
    if (useRealSync) {
      recomputeDashboardSummaries();
    }
    writeSyncLog({
      runId,
      status: 'complete',
      processedCount,
      errorCount,
      durationMs,
      cursor,
      message: `Processed ${registryRows.length} workbook registry rows.`
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * No-op workbook processor used to prove batching before real reads/writes.
 * @param {{ddcName: string, workbookId: string}} registryRow
 * @param {number} index
 * @param {string} runId
 * @return {void}
 */
function processWorkbookNoop_(registryRow, index, runId) {
  console.log(`Run ${runId}: would process ${index + 1} ${registryRow.ddcName} ${registryRow.workbookId}`);
}

/**
 * Reads a real DDC workbook and maps it to dashboard rows.
 * @param {{ddcName: string, workbookId: string}} registryRow
 * @return {{profileActivityRow: Object, meetingScheduleRow: Object, idaRow: Object}}
 */
function processWorkbookData_(registryRow) {
  const dealerProfile = readDealerProfile(registryRow.workbookId);
  const contactReport = readContactReport(registryRow.workbookId);
  const assessments = readAssessments(registryRow.workbookId);
  const daysUntilNextMeeting = getDaysUntil(contactReport.next_meeting_date);

  return {
    profileActivityRow: {
      dealer_id: dealerProfile.dealer_id,
      dealer_name: dealerProfile.dealer_name,
      dealer_address: dealerProfile.dealer_address,
      region: dealerProfile.region,
      dpg: dealerProfile.dpg,
      som: dealerProfile.som,
      ddc_name: registryRow.ddcName,
      current_meeting_date: contactReport.current_meeting_date,
      next_meeting_date: contactReport.next_meeting_date,
      mystery_shop_score: contactReport.mystery_shop_score,
      dealer_attendees: contactReport.dealer_attendees,
      mbusa_attendees: contactReport.mbusa_attendees,
      meeting_summary: contactReport.meeting_summary,
      q3_action_plan_1: contactReport.q3_action_plan_1,
      q3_action_plan_2: contactReport.q3_action_plan_2,
      q3_action_plan_3: contactReport.q3_action_plan_3,
      generated_pdf_url: contactReport.generated_pdf_url
    },
    meetingScheduleRow: {
      dealer_id: dealerProfile.dealer_id,
      dealer_name: dealerProfile.dealer_name,
      ddc_name: registryRow.ddcName,
      current_meeting_date: contactReport.current_meeting_date,
      next_meeting_date: contactReport.next_meeting_date,
      days_until_next_meeting: daysUntilNextMeeting,
      meeting_status: getMeetingStatus(contactReport.next_meeting_date)
    },
    idaRow: Object.assign(
      {
        dealer_id: dealerProfile.dealer_id,
        dealer_name: dealerProfile.dealer_name,
        ddc_name: registryRow.ddcName
      },
      assessments.preAssessment,
      assessments.inStoreAssessment
    )
  };
}
