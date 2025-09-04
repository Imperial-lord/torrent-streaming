import WebTorrent from 'webtorrent';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fsExtra from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_TRACKERS = [
    'udp://tracker.openbittorrent.com:80',
    'udp://tracker.opentrackr.org:1337',
    'udp://tracker.internetwarriors.net:1337',
    'udp://tracker.coppersurfer.tk:6969',
    'udp://tracker.leechers-paradise.org:6969',
    'udp://tracker.pirateparty.gr:6969',
    'udp://tracker.cyberia.is:6969'
];

const torrentDownloadDir = path.join(__dirname, '../downloads');

const DEFAULT_STATUS = {
    name: '',
    progress: 0,
    downloadedBytes: 0,
    isDownloading: false,
    isDone: false,
    downloadPath: '',
    files: [],
    startTime: null,
    durationSeconds: null,
    error: null
};

let status = { ...DEFAULT_STATUS };

export const downloadTorrent = (torrentUrl) => {
    throwErrorIfInvalidUrl(torrentUrl);
    throwErrorIfDownloading();

    // ✅ Reset status for a clean run (prevents stale isDone/progress, etc.)
    status = { ...DEFAULT_STATUS, isDone: false, error: null };

    const client = new WebTorrent();

    // Optional: capture client-level errors too
    client.on('error', (err) => {
        status.isDownloading = false;
        status.isDone = false;
        status.error = err?.message || String(err);
        try { client.destroy(); } catch {}
    });

    client.add(
        torrentUrl,
        { announce: DEFAULT_TRACKERS, path: torrentDownloadDir },
        (torrent) => {
            console.log(`📥 Started torrenting: ${torrent.name}`);
            fsExtra.ensureDirSync(torrentDownloadDir);

            const torrentPath = path.join(torrentDownloadDir, torrent.name);

            // mark as downloading only when we actually have the torrent
            status.isDownloading = true;
            status.isDone = false;
            status.name = torrent.name;
            status.downloadPath = torrentPath;
            status.startTime = Date.now();
            status.durationSeconds = null;
            status.files = torrent.files.map((file) => ({
                name: file.name,
                path: file.path,
                lengthBytes: file.length
            }));

            // update progress using torrent's own counters (safer than summing bytes)
            const updateProgress = () => {
                status.progress = Math.round(torrent.progress * 100);
                status.downloadedBytes = torrent.downloaded;
            };

            updateProgress();

            torrent.on('download', () => {
                updateProgress();
            });

            torrent.on('done', () => {
                console.log('🏁 Torrent download complete');
                updateProgress();
                status.progress = 100;
                status.isDone = true;
                status.isDownloading = false;

                const endTime = Date.now();
                status.durationSeconds = Math.round((endTime - status.startTime) / 1000);

                // remove torrent from client (keeps files on disk)
                try {
                    client.remove(torrent.infoHash, () => {
                        try { client.destroy(); } catch {}
                    });
                } catch {
                    try { client.destroy(); } catch {}
                }
            });

            torrent.on('error', (err) => {
                console.error('❌ Torrent error:', err);
                status.error = err?.message || String(err);
                status.isDownloading = false;
                status.isDone = false; // ensure we don't report done on error
                try { client.destroy(); } catch {}
            });
        }
    );
};

export const getTorrentStatus = () => {
    return status;
};

export const cleanUpDownloadFolder = () => {
    throwErrorIfDownloading();

    fs.rm(torrentDownloadDir, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error(`⚠️ Failed to delete temp files`, err);
        } else {
            console.log(`🧹 Deleted local torrent files`);
        }
    });

    // reset to pristine idle state
    status = { ...DEFAULT_STATUS };
};

const throwErrorIfInvalidUrl = (torrentUrl) => {
    if (!torrentUrl) {
        throw new Error('Provide a torrent URL');
    }
    const parsed = new URL(torrentUrl);
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const isTorrentFile = parsed.pathname.endsWith('.torrent');
    if (!isHttp || !isTorrentFile) throw new Error('Provide a valid torrent URL');
};

const throwErrorIfDownloading = () => {
    if (status.isDownloading) {
        throw new Error('Another torrent is already downloading.');
    }
};