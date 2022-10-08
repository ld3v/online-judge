export default {
  // Main
  'settings.update-info.success': 'Update configuration successfully',
  // Form
  'settings.form.configuration.title': 'Configuration',

  'settings.form.configuration.file_size_limit.label': 'File size limit (kB)',
  'settings.form.configuration.file_size_limit.placeholder': '50000',
  'settings.form.configuration.file_size_limit.required': 'Not allow empty',

  'settings.form.configuration.output_size_limit.label': 'Output size limit (kB)',
  'settings.form.configuration.output_size_limit.placeholder': '1024',
  'settings.form.configuration.output_size_limit.required': 'Not allow empty',

  'settings.form.configuration.default_late_rule.label': 'Default coefficient rule',
  'settings.form.configuration.default_late_rule.placeholder': 'PHP Script without <?php ?>',
  'settings.form.configuration.default_late_rule.required': 'Not allow empty',

  'settings.form.configuration.submit_penalty.label': '',
  'settings.form.configuration.submit_penalty.placeholder': '300',
  'settings.form.configuration.submit_penalty.required': 'Not allow empty',

  'settings.form.configuration.enable_registration.label': 'Allow registration?',
  'settings.form.configuration.enable_registration.description': 'Allow anyone can create a new account',

  'settings.form.configuration.moss_userid.label': 'Moss userId',
  'settings.form.configuration.moss_userid.placeholder': 'moss_userid',
  'settings.form.configuration.moss_userid.required': 'Not allow empty',
  // Sync configuration
  'settings.sync-configuration': 'Sync system configuration',
  'settings.sync-configuration.description': 'Sync with wecode-judge {judgeURL, select, false {} other { with URL: "{judgeURL}"}}.<br>You can change URL content in backend environment variables.',
  'settings.sync-configuration.submit-title': 'Sync',
  'settings.sync-configuration.success': 'Sync with wecode-judge successfully! Please refresh your page to update latest configuration!',
  // Sync data
  'settings.sync-all-data': 'Sync all of data',
  'settings.sync-all-data.description': 'This action will <b>get all of data from JUDGE system</b> and <b>import it to the current system</b>. Of course, all of data in the current system will be removed!<br/><b>So, be careful when use this feature!</b>',
  'settings.sync-all-data.no-processing': 'No process is in progress!',
  'settings.sync-all-data.sync-button-title': 'Sync now',
  'settings.sync-all-data.history-title': 'Sync history',
  'settings.sync-all-data.process.current.title': 'Syncing... - <small>(jobId#{jobId} - queueId#{queueId} - {time})</small>.',
  'settings.sync-all-data.process.title': 'Synced at <i>{time}</i> - <small>(jobId#{jobId} - queueId#{queueId})</small>.',
  // Sync data - Items
  'settings.sync-all-data.process._.account': 'Update accounts.',
  'settings.sync-all-data.process._.language': 'Update languages.',
  'settings.sync-all-data.process._.problem': 'Update problems.',
  'settings.sync-all-data.process._.assignment': 'Update assignments.',
  'settings.sync-all-data.process._.problem-languages': 'Add languages to problems.',
  'settings.sync-all-data.process._.assignment-problems': 'Add problems to assignments.',

  // Exceptions
  'exception.settings.sync-configuration.failed': 'Sync failed! Please try again later!',
  'exception.settings.sync-all-data.process-empty-info': 'Unexpected error appear when render this process\'s info.',
  'exception.settings.sync-all-data.history.empty': 'No data sync times',
};