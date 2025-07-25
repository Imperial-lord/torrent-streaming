import { downloadTorrent, getTorrentStatus, cleanUpDownloadFolder } from '../services/torrentDownloader.js';

export const postDownload = (req, res) => {
    try {
        const { torrentUrl } = req.query;
        downloadTorrent(torrentUrl);
        res.status(202).json({ message: 'Download started' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getStatus = (_req, res) => {
    res.status(200).json(getTorrentStatus());
};

export const deleteDownload = (_req, res) => {
    try {
        cleanUpDownloadFolder();
        res.status(200).json({ message: 'Download folder cleaned' });
    } catch (err) {
        res.status(409).json({ error: err.message });
    }
};