const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const RETRYABLE_FILE_ERRORS = new Set(['EBUSY', 'EPERM']);
const FILE_RETRY_DELAYS_MS = [50, 100, 200, 500, 1000];
const fileQueues = new Map();
const rowCache = new Map();

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function withFileRetry(operation) {
    let lastError;

    for (let attempt = 0; attempt <= FILE_RETRY_DELAYS_MS.length; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (!RETRYABLE_FILE_ERRORS.has(error.code) || attempt === FILE_RETRY_DELAYS_MS.length) {
                throw error;
            }

            await wait(FILE_RETRY_DELAYS_MS[attempt]);
        }
    }

    throw lastError;
}

async function withFileQueue(filePath, operation) {
    const previous = fileQueues.get(filePath) || Promise.resolve();
    const current = previous
        .catch(() => {})
        .then(operation);

    fileQueues.set(filePath, current);

    try {
        return await current;
    } finally {
        if (fileQueues.get(filePath) === current) {
            fileQueues.delete(filePath);
        }
    }
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

function isRetryableFileError(error) {
    return RETRYABLE_FILE_ERRORS.has(error?.code);
}

function recordToRow(header, record) {
    return header.reduce((row, item) => {
        row[item.title] = record[item.id] || '';
        return row;
    }, {});
}

async function appendCsvRecord(fileName, header, record) {
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = path.join(dataDir, fileName);
    return withFileQueue(filePath, async () => {
        let writtenPath;

        try {
            writtenPath = await appendCsvRecordToPath(filePath, header, record);
        } catch (error) {
            if (!isRetryableFileError(error)) {
                throw error;
            }

            const lockedError = new Error(`${fileName} is open in Excel or another app. Close the CSV file, then reserve again.`);
            lockedError.statusCode = 423;
            lockedError.code = error.code;
            throw lockedError;
        }

        const cachedRows = rowCache.get(filePath);

        if (cachedRows) {
            cachedRows.push(recordToRow(header, record));
        }

        return writtenPath;
    });
}

async function appendCsvRecordToPath(filePath, header, record) {
        const exists = await fileExists(filePath);
        const titles = header.map((item) => item.title);

        if (!exists) {
            await withFileRetry(() => fs.writeFile(filePath, `${toCsvLine(titles)}\n`, 'utf8'));
        } else {
            await ensureCsvHeaders(filePath, titles);
        }

        const values = header.map((item) => record[item.id] || '');
        await withFileRetry(() => fs.appendFile(filePath, `${toCsvLine(values)}\n`, 'utf8'));
        return filePath;
}

async function ensureCsvHeaders(filePath, titles) {
    const content = await withFileRetry(() => fs.readFile(filePath, 'utf8'));

    if (!content.trim()) {
        await withFileRetry(() => fs.writeFile(filePath, `${toCsvLine(titles)}\n`, 'utf8'));
        return;
    }

    const lines = content.trim().split(/\r?\n/);
    const currentTitles = parseCsvLine(lines[0]);

    if (currentTitles.join('|') === titles.join('|')) {
        return;
    }

    const migratedRows = lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        const row = currentTitles.reduce((result, title, index) => {
            result[title] = values[index] || '';
            return result;
        }, {});

        return titles.map((title) => row[title] || '');
    });

    const nextContent = [
        toCsvLine(titles),
        ...migratedRows.map((row) => toCsvLine(row))
    ].join('\n');

    await withFileRetry(() => fs.writeFile(filePath, `${nextContent}\n`, 'utf8'));
}

async function readCsvRows(fileName) {
    const filePath = path.join(dataDir, fileName);

    return withFileQueue(filePath, async () => {
        try {
            const rows = await readCsvRowsFromPath(filePath);
            rowCache.set(filePath, rows);
            return rows;
        } catch (error) {
            if (!isRetryableFileError(error)) {
                throw error;
            }

            console.warn(`[WARN] ${path.basename(filePath)} is locked. Using cached CSV rows.`);
            return rowCache.get(filePath) || [];
        }
    });
}

async function readCsvRowsFromPath(filePath) {
        if (!(await fileExists(filePath))) {
            return [];
        }

        const content = await withFileRetry(() => fs.readFile(filePath, 'utf8'));
        const lines = content.trim().split(/\r?\n/);

        if (lines.length <= 1) {
            return [];
        }

        const headers = parseCsvLine(lines[0]);

        return lines.slice(1).map((line) => {
            const values = parseCsvLine(line);
            return headers.reduce((row, header, index) => {
                row[header] = values[index] || '';
                return row;
            }, {});
        });
}

function parseCsvLine(line) {
    const values = [];
    let current = '';
    let insideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const nextChar = line[index + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            current += '"';
            index += 1;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
}

function toCsvLine(values) {
    return values.map((value) => {
        const text = String(value ?? '');
        const escaped = text.replace(/"/g, '""');

        return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',');
}

module.exports = {
    appendCsvRecord,
    readCsvRows
};
