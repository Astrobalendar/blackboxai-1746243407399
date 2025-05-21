import { scanForUnusedFiles, findDuplicateComponents } from '../utils/fs-utils';
import { validateRoutes } from '../utils/route-utils';
import prompts from 'prompts';
import fs from 'fs';

(async () => {
  const unusedFiles = await scanForUnusedFiles(['../apps/frontend/src/components', '../apps/frontend/src/pages']);
  console.log('Unused files:\n', unusedFiles.join('\n'));
  const { confirmDelete } = await prompts({
    type: 'confirm',
    name: 'confirmDelete',
    message: 'Delete these files? (This cannot be undone)',
    initial: false
  });
  if (confirmDelete) {
    // Add deletion logic here
    console.log('Files deleted (mock).');
  }

  const result = await validateRoutes('../apps/frontend/src/Routes.tsx');
  console.log('Route validation report:\n', result.report);
  if (result.issues.length) {
    process.exitCode = 1;
  }

  const duplicates = await findDuplicateComponents(['../apps/frontend/src/components', '../apps/frontend/src/pages']);
  if (duplicates.length) {
    console.log('Duplicate components found:\n', duplicates.join('\n'));
  } else {
    console.log('No duplicate components detected.');
  }

  const unused = fs.existsSync('unused-files.txt') ? fs.readFileSync('unused-files.txt', 'utf-8') : '';
  const duplicatesFromFile = fs.existsSync('duplicate-components.txt') ? fs.readFileSync('duplicate-components.txt', 'utf-8') : '';
  const report = `# AkuraAstrology Automation Report

## Unused Files
${unused || 'None detected.'}

## Duplicate Components
${duplicatesFromFile || 'None detected.'}

## Suggested Actions
- Review and remove unused files.
- Resolve duplicate components.
- Rerun validation after changes.
`;
  fs.writeFileSync('report.md', report);
  console.log('Report generated: report.md');
})();