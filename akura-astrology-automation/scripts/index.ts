import prompts from 'prompts';
import { execSync } from 'child_process';

(async () => {
  const { task } = await prompts({
    type: 'select',
    name: 'task',
    message: 'Select an automation task',
    choices: [
      { title: '🧹 Cleanup Unused Files', value: 'cleanup' },
      { title: '🧭 Validate Routes', value: 'validate' },
      { title: '🚀 Deploy', value: 'deploy' }
    ]
  });

  if (!task) return;

  const commandMap: Record<string, string> = {
    cleanup: 'npm run cleanup',
    validate: 'npm run validate',
    deploy: 'npm run deploy'
  };

  execSync(commandMap[task], { stdio: 'inherit' });
})();