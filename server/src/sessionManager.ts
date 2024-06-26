/*
 * Copyright (c) Eric Traut
 * Manages a collection of playground sessions. It tracks the set of active
 * sessions and manages their lifetimes.
 */

import * as fs from 'fs';
import { mkdir } from 'fs/promises';
import { exec, fork } from 'node:child_process';
import * as os from 'os';
import packageJson from 'package-json';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { LspClient } from './lspClient';
import { Session, SessionId, SessionOptions } from './session';
import { logger } from './logging';
import { PluginManager } from 'live-plugin-manager';

export interface InstallPyrightInfo {
    pyrightVersion: string;
    localDirectory: string;
}

// Map of sessions indexed by ID
const activeSessions = new Map<SessionId, Session>();

// Maximum time a session can be idle before it is closed.
const maxSessionLifetime = 1 * 60 * 1000; // 1 minute

// Maximum number of pyright versions to return to the caller.
const maxPyrightVersionCount = 50;

// If the caller doesn't specify the pythonVersion or pythonPlatform,
// default to these. Otherwise the language server will pick these
// based on whatever version of Python happens to be installed in
// the container it's running in.
const defaultPythonVersion = '3.12';
const defaultPythonPlatform = 'All';

// Active lifetime timer for harvesting old sessions.
let lifetimeTimer: NodeJS.Timeout | undefined;

export function getSessionById(id: SessionId) {
    const session = activeSessions.get(id);

    if (session) {
        session.lastAccessTime = Date.now();
    }

    return session;
}

// Allocate a new session and return its ID.
export async function createNewSession(
    sessionOptions: SessionOptions | undefined
): Promise<SessionId> {
    scheduleSessionLifetimeTimer();

    return installPyright(sessionOptions?.pyrightVersion).then((info) => {
        return startSession(info.localDirectory, sessionOptions);
    });
}

// Attempts to close the session and cleans up its resources. It
// silently fails if it cannot.
export function closeSession(sessionId: SessionId) {
    const session = activeSessions.get(sessionId);
    if (!session) {
        return;
    }

    session.langClient?.cancelRequests();

    // If the process exists, attempt to kill it.
    if (session.langServerProcess) {
        session.langServerProcess.kill();
    }

    session.langServerProcess = undefined;
    activeSessions.delete(sessionId);

    // Dispose of the temporary directory.
    try {
        fs.rmSync(session.tempDirPath, { recursive: true });
    } catch (e) {
        // Ignore error.
    }
}

export async function getPyrightVersions(): Promise<string[]> {
    return packageJson('basedpyright', { allVersions: true, fullMetadata: false })
        .then((response) => {
            let versions = Object.keys(response.versions);

            // filter out canary versions
            versions = versions.filter((verion) => !verion.includes('-'));

            // Return the latest version first.
            versions = versions.reverse();

            // Limit the number of versions returned.
            versions = versions.slice(0, maxPyrightVersionCount);

            return versions;
        })
        .catch((err) => {
            throw new Error(`Failed to get versions of pyright: ${err}`);
        });
}

export async function getPyrightLatestVersion(): Promise<string> {
    return packageJson('basedpyright')
        .then((response) => {
            if (typeof response.version === 'string') {
                logger.info(`Received latest pyright version from npm index: ${response.version}`);
                return response.version;
            }

            throw new Error(`Received unexpected latest version for pyright`);
        })
        .catch((err) => {
            throw new Error(`Failed to get latest version of pyright: ${err}`);
        });
}

export function startSession(
    binaryDirPath: string,
    sessionOptions?: SessionOptions
): Promise<SessionId> {
    return new Promise<SessionId>((resolve, reject) => {
        // Launch a new instance of the language server in another process.
        logger.info(`Spawning new pyright language server from ${binaryDirPath}`);
        const binaryPath = path.join(
            process.cwd(),
            binaryDirPath,
            './node_modules/basedpyright/langserver.index.js'
        );

        // Create a temp directory where we can store a synthesized config file.
        const tempDirPath = fs.mkdtempSync(path.join(os.tmpdir(), 'pyright_playground'));

        // Synthesize a "pyrightconfig.json" file from the session options and write
        // it to the temp directory so the language server can find it.
        synthesizePyrightConfigFile(tempDirPath, sessionOptions);

        // Set the environment variable for the locale. Older versions
        // of pyright don't handle the local passed via the LSP initialize
        // request.
        const env = { ...process.env };
        if (sessionOptions?.locale) {
            env.LC_ALL = sessionOptions.locale;
        }

        const langServerProcess = fork(
            binaryPath,
            ['--node-ipc', `--clientProcessId=${process.pid.toString()}`],
            {
                cwd: tempDirPath,
                silent: true,
                env,
            }
        );

        // Create a new UUID for a session ID.
        const sessionId = uuid();

        // Create a new session object.
        const session: Session = {
            id: sessionId,
            lastAccessTime: Date.now(),
            tempDirPath,
        };

        // Start tracking the session.
        activeSessions.set(sessionId, session);

        langServerProcess.on('spawn', () => {
            logger.info(`Pyright language server started`);
            session.langServerProcess = langServerProcess;
            session.langClient = new LspClient(langServerProcess);

            session.langClient
                .initialize(tempDirPath, sessionOptions)
                .then(() => {
                    resolve(sessionId);
                })
                .catch((err) => {
                    reject(`Failed to start pyright language server connection`);
                    closeSession(sessionId);
                });
        });

        langServerProcess.on('error', (err) => {
            // Errors can be reported for a variety of reasons even after
            // the language server has been started.
            if (!session.langServerProcess) {
                logger.error(`Pyright language server failed to start: ${err.message}`);
                reject(`Failed to spawn pyright language server instance`);
            }

            closeSession(sessionId);
        });

        langServerProcess.on('exit', (code) => {
            logger.info(`Pyright language server exited with code ${code}`);
            closeSession(sessionId);
        });

        langServerProcess.on('close', (code) => {
            logger.info(`Pyright language server closed with code ${code}`);
            closeSession(sessionId);
        });
    });
}

async function installPyright(requestedVersion: string | undefined): Promise<InstallPyrightInfo> {
    logger.info(`Pyright version ${requestedVersion || 'latest'} requested`);

    let version: string;
    if (requestedVersion) {
        version = requestedVersion;
    } else {
        version = await getPyrightLatestVersion();
    }

    const dirName = `./pyright_local/${version}`;

    if (fs.existsSync(dirName)) {
        logger.info(`Pyright version ${version} already installed`);
        return { pyrightVersion: version, localDirectory: dirName };
    }

    logger.info(`Attempting to install pyright version ${version}`);
    try {
        await mkdir(path.join(dirName, 'node_modules'), { recursive: true });
        const manager = new PluginManager({ pluginsPath: path.join(dirName, 'node_modules') });
        await manager.install('basedpyright', version);
    } catch (err) {
        logger.error(`Failed to install pyright ${version} (error: ${err})`);
        throw `Failed to install pyright@${version}`;
    }
    logger.info(`Install of pyright ${version} succeeded`);
    return { pyrightVersion: version, localDirectory: dirName };
}

function synthesizePyrightConfigFile(tempDirPath: string, sessionOptions?: SessionOptions) {
    const configFilePath = path.join(tempDirPath, 'pyrightconfig.json');
    const config: any = {};

    if (sessionOptions?.pythonVersion) {
        config.pythonVersion = sessionOptions.pythonVersion;
    } else {
        config.pythonVersion = defaultPythonVersion;
    }

    if (sessionOptions?.pythonPlatform) {
        config.pythonPlatform = sessionOptions.pythonPlatform;
    } else {
        config.pythonPlatform = defaultPythonPlatform;
    }

    if (sessionOptions?.typeCheckingMode) {
        config.typeCheckingMode = sessionOptions.typeCheckingMode;
    }

    if (sessionOptions?.configOverrides) {
        Object.keys(sessionOptions.configOverrides).forEach((key) => {
            config[key] = sessionOptions.configOverrides![key];
        });
    }

    const configJson = JSON.stringify(config);
    fs.writeFileSync(configFilePath, configJson);
}

// If there is no session lifetime timer, schedule one.
function scheduleSessionLifetimeTimer() {
    if (lifetimeTimer) {
        return;
    }

    const lifetimeTimerFrequency = 1 * 60 * 1000; // 1 minute

    lifetimeTimer = setTimeout(() => {
        lifetimeTimer = undefined;

        const curTime = Date.now();

        activeSessions.forEach((session, sessionId) => {
            if (curTime - session.lastAccessTime > maxSessionLifetime) {
                logger.info(`Session ${sessionId} timed out; deleting`);
                closeSession(sessionId);
                activeSessions.delete(sessionId);
            }
        });

        if (activeSessions.size === 0) {
            scheduleSessionLifetimeTimer();
        }
    }, lifetimeTimerFrequency);
}
