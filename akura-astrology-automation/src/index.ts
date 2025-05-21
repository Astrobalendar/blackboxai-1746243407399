import { cleanup } from '../scripts/cleanup';
import { deploy } from '../scripts/deploy';
import { checkUnusedAndDuplicates } from '../scripts/check-unused-and-duplicates';

async function main() {
    console.log('Starting AkuraAstrology automation...');

    await checkUnusedAndDuplicates();
    await cleanup();
    await deploy();

    console.log('Automation tasks completed.');
}

main().catch(error => {
    console.error('Error during automation:', error);
    process.exit(1);
});