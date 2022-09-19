export default {
  // Main
  'settings.update-info.success': 'Update configuration successfully',
  // Form
  'settings.form.configuration.title': 'Configuration',

  'settings.form.configuration.concurent_queue_process.label': 'Number of queue process',
  'settings.form.configuration.concurent_queue_process.placeholder': '2',
  'settings.form.configuration.concurent_queue_process.required': 'Not allow empty',

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
  'settings.sync-configuration.success': 'Sync with wecode-judge successfully!',
  // Sync data
  'settings.sync-data': 'Sync data',
};
