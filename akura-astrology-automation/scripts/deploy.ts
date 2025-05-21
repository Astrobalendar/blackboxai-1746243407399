import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import path from 'path';

const execPromise = promisify(exec);

async function deploy() {
    try {
        const configPath = path.resolve(__dirname, '../config/deployment.config.json');
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));

        // Example deployment logic for Render
        if (config.service === 'Render') {
            console.log('Deploying to Render...');
            await execPromise(`render deploy --service ${config.serviceName}`);
        }
        // Example deployment logic for Netlify
        else if (config.service === 'Netlify') {
            console.log('Deploying to Netlify...');
            await execPromise(`netlify deploy --prod --site ${config.siteId}`);
        } else {
            console.error('Unsupported deployment service specified in config.');
        }

        console.log('Deployment completed successfully.');
    } catch (error) {
        console.error('Deployment failed:', error);
    }
}

deploy();