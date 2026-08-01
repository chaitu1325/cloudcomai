import ftp from 'basic-ftp';
import fs from 'fs';

async function runBackup() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: process.env.FTP_SERVER,
            user: process.env.FTP_USERNAME,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = `/backups/html-backup-${timestamp}`;

        console.log(`Creating backup folder: ${backupDir}`);
        await client.ensureDir(backupDir);

        // 1. Create a clean temporary local folder containing only deployment files
        const stagingDir = "./deploy-staging";
        if (!fs.existsSync(stagingDir)) fs.mkdirSync(stagingDir);

        // Define files and folders to deploy matching your repository structure
        const deployItems = ['index.html', 'assets', 'css', 'js', 'legal'];
        
        for (const item of deployItems) {
            if (fs.existsSync(item)) {
                fs.cpSync(item, `${stagingDir}/${item}`, { recursive: true });
            }
        }

        // 2. Upload only these production deployment files to the GoDaddy backup vault
        console.log("Uploading deployment files safely to backup vault...");
        await client.uploadFromDir(stagingDir, backupDir);

        // 3. Clean up the temporary staging directory on the GitHub runner
        fs.rmSync(stagingDir, { recursive: true, force: true });

        console.log("Backup completed successfully!");
    } catch (err) {
        console.error("Backup failed! Halting pipeline to protect live site.", err);
        process.exit(1); 
    } finally {
        client.close();
    }
}
runBackup();
