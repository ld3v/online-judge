export default {
  'problem.no-langs': 'No languages',
  'problem.no-assignments': 'Not assignments',
  'problem.add': 'Create a new problem',
  'problem.create': 'Create problem',
  'problem.create.success': 'Create problem successfully!',
  'problem.update': "Update problem",
  'problem.update.success': "Update problem successfully!",
  'problem.delete': 'Delete problem',
  'problem.delete.success': 'Delete problem successfully',
  'problem.do-problem.title': 'Solution',
  'problem.search': 'Search with name, or note,...',
  'problem.assignment-using.extra': '+ {count} {count, plural, one {assignment}, other {assignments}',
  'problem.lang-using.extra': '+ {count} {count, plural, one {language}, other {languages}',
  'problem.my.no-assignment-selected': 'No assignment was selected! Select an assignment to continue!',
  'problem.my.assignment-not-found': 'Assignment not found! Select an assignment to continue!',
  // Table
  'problem.table.view.problem-list': 'Problem list',
  'problem.table.name': 'Display name',
  'problem.table.score': 'Score',
  // Form
  'problem.form.code.label': 'Code',
  'problem.form.code.placeholder': 'Enter your code here',
  'problem.form.name.label': 'Name',
  'problem.form.name.placeholder': 'Your problem name',
  'problem.form.content.label': 'Content',
  'problem.form.content.description': 'You can use markdown to format your content',
  'problem.form.admin-note.label': 'Note for admin',
  'problem.form.admin-note.description': 'Only admin can view this',
  'problem.form.admin-note.placeholder': 'This problem use for...',
  'problem.form.diff-command.label': '<code>Diff</code> command',
  'problem.form.diff-command.command.placeholder': 'diff',
  'problem.form.diff-command.arguments.placeholder': '-bB',
  'problem.form.languages.label': 'Language programing',
  'problem.form.languages.description': 'Select and config <b>time-limit</b> and <b>memory-limit</b> for language',
  'problem.form.test-folder.label': 'Test cases & Template',
  'problem.form.test-folder.description': 'Your folder should have a lot of file with name <code>input_.txt</code> or <code>output_.txt</code>. To setup template for exam\'s code, upload file with name <code>template.cpp</code> . Read more about this, <a href="https://github.com/nqhd3v/online-judge/blob/main/api/docs/solution-checking.md" target="_blank">here</a>.',
  'problem.form.submit-problem': 'Submit your solution',
  'problem.form.submit-create': 'Create',
  'problem.form.submit-update': 'Update',
  // Exceptions
  'exception.problem.form.languages.required': 'Please select at least an language!',
  'exception.problem.form.name.required': 'Please enter your problem\'s name!',
  'exception.problem.form.diff-command.required': 'Please enter your <code>diff</code> command',
  'exception.problem.form.content.required': 'Please enter your problem\'s content',
  'exception.problem.form.languages.no-selected': 'No language was selected!',
  'exception.problem.notfound':
    '{ isMany, select, true {These problems are} other {This problem is} } not existed in our system!',
  'exception.problem.solution-checking.includes-other-files': 'Folder upload should have only files, which have names is input_.txt, output_.txt, or template.cpp',
  'exception.problem.solution-checking.input-diff-output': 'Has {inpCount} input files, but has {outCount} output files',
  'exception.problem.solution-checking.duplicated-filenames': 'Maybe a lot of files have the same filename!'
};
