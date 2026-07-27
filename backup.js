import ftp from 'basic-ftp';

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

        console.log("Downloading current GoDaddy public_html contents...");
        await client.downloadToDir("./live-site-backup", "/public_html");

        console.log("Uploading files safely to backup vault...");
        await client.uploadFromDir("./live-site-backup", backupDir);

        console.log("Backup completed successfully!");
    } catch (err) {
        console.error("Backup failed! Halting pipeline to protect live site.", err);
        process.exit(1); 
    } finally {
        client.close();
    }
}
runBackup();
