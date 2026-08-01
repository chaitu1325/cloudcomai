import ftp from 'basic-ftp';
import fs from 'fs';
import archiver from 'archiver';

function zipDeploymentFiles(outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));
        archive.pipe(output);

        // Explicitly include only your web files
        archive.file('index.html', { name: 'index.html' });
        if (fs.existsSync('assets')) archive.directory('assets/', 'assets');
        if (fs.existsSync('css')) archive.directory('css/', 'css');
        if (fs.existsSync('js')) archive.directory('js/', 'js');
        if (fs.existsSync('legal')) archive.directory('legal/', 'legal');

        archive.finalize();
    });
}

async function runBackup() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipName = `html-backup-${timestamp}.zip`;
    const localZipPath = `./${zipName}`;

    try {
        console.log("Compressing production files into a single ZIP archive...");
        await zipDeploymentFiles(localZipPath);

        await client.access({
            host: process.env.FTP_SERVER,
            user: process.env.FTP_USERNAME,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        console.log("Creating backup directory...");
        await client.ensureDir("/backups");

        console.log(`Uploading compressed backup (${zipName}) to GoDaddy vault...`);
        // Uploads a single file instantly instead of looping through thousands
        await client.uploadFrom(localZipPath, `/backups/${zipName}`);

        console.log("Backup completed successfully in seconds!");
    } catch (err) {
        console.error("Backup failed!", err);
        process.exit(1); 
    } finally {
        if (fs.existsSync(localZipPath)) fs.unlinkSync(localZipPath);
        client.close();
    }
}
runBackup();
