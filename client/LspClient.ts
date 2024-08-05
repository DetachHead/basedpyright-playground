/*
 * Copyright (c) Eric Traut
 * Acts as a simple language server protocol (LSP) client that exchanges
 * information with a language server.
 */

import {
    BrowserMessageReader,
    BrowserMessageWriter,
} from 'vscode-jsonrpc/browser';
import {
    CompletionItem,
    CompletionList,
    CompletionParams,
    CompletionRequest,
    CompletionResolveRequest,
    ConfigurationParams,
    Diagnostic,
    DiagnosticTag,
    DidChangeConfigurationParams,
    DidChangeTextDocumentParams,
    DidOpenTextDocumentParams,
    Hover,
    HoverParams,
    HoverRequest,
    MessageConnection,
    NotificationType,
    RequestType,
    createMessageConnection,
    InitializeParams,
    InitializeRequest,
    LogMessageParams,
    Position,
    PublishDiagnosticsParams,
    RenameParams,
    RenameRequest,
    SignatureHelp,
    SignatureHelpParams,
    SignatureHelpRequest,
    WorkspaceEdit,
} from 'vscode-languageserver-protocol';
import { SessionOptions } from './LspSession';
import { getPyrightVersions, packageName } from './sessionManager'
import 'remote-web-worker'


export interface LspClientNotifications {
    onWaitingForInitialization?: (isWaiting: boolean) => void;
    onDiagnostics?: (diag: Diagnostic[]) => void;
    onError?: (message: string) => void; // TODO
}

const rootPath = '/src/'

const rootUri = `file://${rootPath}`

const fileName = 'Untitled.py'

const documentUri = rootUri + fileName

export class LspClient {
    public connection: MessageConnection | undefined;
    private _documentVersion = 1;
    private _documentText = '';
    private _notifications: LspClientNotifications;

    requestNotification(notifications: LspClientNotifications) {
        this._notifications = notifications;
    }

    public updateCode = (code: string) => [
        this._documentText = code
    ]

    public async initialize(sessionOptions?: SessionOptions) {
        this._notifications.onWaitingForInitialization(true)
        const workerScript = `https://cdn.jsdelivr.net/npm/${packageName}@${sessionOptions.pyrightVersion ?? (await getPyrightVersions())[0]}/dist/pyright.worker.js`;
        const foreground = new Worker(workerScript, {
            name: 'Pyright-foreground',
            type: 'classic'
        });
        foreground.postMessage({
            type: "browser/boot",
            mode: "foreground",
        });
        const connection = createMessageConnection(
            new BrowserMessageReader(foreground),
            new BrowserMessageWriter(foreground)
        );
        const workers: Worker[] = [foreground];
        connection.onDispose(() => {
            workers.forEach((w) => w.terminate());
        });

        let backgroundWorkerCount = 0;
        foreground.addEventListener("message", (e: MessageEvent) => {
            if (e.data && e.data.type === "browser/newWorker") {
                // Create a new background worker.
                // The foreground worker has created a message channel and passed us
                // a port. We create the background worker and pass transfer the port
                // onward.
                const { initialData, port } = e.data;
                const background = new Worker(workerScript, {
                    name: `Pyright-background-${++backgroundWorkerCount}`,
                });
                workers.push(background);
                background.postMessage(
                    {
                        type: "browser/boot",
                        mode: "background",
                        initialData,
                        port,
                    },
                    [port]
                );
            }
        });


        this.connection = connection

        this.connection.listen();

        // Initialize the server.
        const init: InitializeParams = {
            rootUri,
            rootPath,
            processId: 1,
            capabilities: {
                textDocument: {
                    publishDiagnostics: {
                        tagSupport: {
                            valueSet: [DiagnosticTag.Unnecessary, DiagnosticTag.Deprecated],
                        },
                        versionSupport: true,
                    },
                    hover: {
                        contentFormat: ['markdown', 'plaintext'],
                    },
                    signatureHelp: {},
                }
            },
            initializationOptions: {
                files: {[rootPath + fileName]: this._documentText, [rootPath+'pyrightconfig.json']: JSON.stringify({typeshedPath: '/typeshed', ...sessionOptions, ...sessionOptions.configOverrides})}
            }
        };

        if (sessionOptions?.locale) {
            init.locale = sessionOptions.locale;
        }

        await this.connection.sendRequest(InitializeRequest.type, init);

        // Update the settings.
        await this.connection.sendNotification(
            new NotificationType<DidChangeConfigurationParams>('workspace/didChangeConfiguration'),
            {
                settings: {},
            }
        );

        // Simulate an "open file" event.
        await this.connection.sendNotification(
            new NotificationType<DidOpenTextDocumentParams>('textDocument/didOpen'),
            {
                textDocument: {
                    uri: documentUri,
                    languageId: 'python',
                    version: this._documentVersion,
                    text: this._documentText,
                },
            }
        );

        // Receive diagnostics from the language server.
        this.connection.onNotification(
            new NotificationType<PublishDiagnosticsParams>('textDocument/publishDiagnostics'),
            (diagInfo) => {
                const diagVersion = diagInfo.version ?? -1;

                console.info(`Received diagnostics for version: ${diagVersion}`);

                this._notifications.onDiagnostics(diagInfo.diagnostics)
            }
        );

        // Log messages received by the language server for debugging purposes.
        this.connection.onNotification(
            new NotificationType<LogMessageParams>('window/logMessage'),
            (info) => {
                console.info(`Language server log message: ${info.message}`);
            }
        );

        // Handle requests for configurations.
        this.connection.onRequest(
            new RequestType<ConfigurationParams, any, any>('workspace/configuration'),
            (params) => {
                console.info(`Language server config request: ${JSON.stringify(params)}}`);
                return [];
            }
        );
        this._notifications.onWaitingForInitialization(false)
    }

    updateSettings = async (sessionOptions: SessionOptions) => {
        this.connection?.dispose()
        await this.initialize(sessionOptions)
    }

    async getHoverInfo(code: string, position: Position): Promise<Hover | null> {
        let documentVersion = this._documentVersion;
        if (this._documentText !== code) {
            documentVersion = await this.updateTextDocument(code);
        }

        const params: HoverParams = {
            textDocument: {
                uri: documentUri,
            },
            position,
        };

        const result = await this.connection
            .sendRequest(HoverRequest.type, params)
            .catch((err) => {
                // Don't return an error. Just return null (no info).
                return null;
            });

        return result;
    }

    async getRenameEdits(
        code: string,
        position: Position,
        newName: string
    ): Promise<WorkspaceEdit | null> {
        let documentVersion = this._documentVersion;
        if (this._documentText !== code) {
            documentVersion = await this.updateTextDocument(code);
        }

        const params: RenameParams = {
            textDocument: {
                uri: documentUri,
            },
            position,
            newName,
        };

        const result = await this.connection
            .sendRequest(RenameRequest.type, params)
            .catch((err) => {
                // Don't return an error. Just return null (no edits).
                return null;
            });

        return result;
    }

    async getSignatureHelp(code: string, position: Position): Promise<SignatureHelp | null> {
        let documentVersion = this._documentVersion;
        if (this._documentText !== code) {
            documentVersion = await this.updateTextDocument(code);
        }

        const params: SignatureHelpParams = {
            textDocument: {
                uri: documentUri,
            },
            position,
        };

        const result = await this.connection
            .sendRequest(SignatureHelpRequest.type, params)
            .catch((err) => {
                // Don't return an error. Just return null (no info).
                return null;
            });

        return result;
    }

    async getCompletion(
        code: string,
        position: Position
    ): Promise<CompletionList | CompletionItem[] | null> {
        let documentVersion = this._documentVersion;
        if (this._documentText !== code) {
            documentVersion = await this.updateTextDocument(code);
        }

        const params: CompletionParams = {
            textDocument: {
                uri: documentUri,
            },
            position,
        };

        const result = await this.connection
            .sendRequest(CompletionRequest.type, params)
            .catch((err) => {
                // Don't return an error. Just return null (no info).
                return null;
            });

        return result;
    }

    async resolveCompletion(completionItem: CompletionItem): Promise<CompletionItem | null> {
        const result = await this.connection
            .sendRequest(CompletionResolveRequest.type, completionItem)
            .catch((err) => {
                // Don't return an error. Just return null (no info).
                return null;
            });

        return result;
    }

    // Sends a new version of the text document to the language server.
    // It bumps the document version and returns the new version number.
    async updateTextDocument(code: string): Promise<number> {
        let documentVersion = ++this._documentVersion;
        this._documentText = code;

        console.info(`Updating text document to version ${documentVersion}`);

        // Send the updated text to the language server.
        return this.connection
            .sendNotification(
                new NotificationType<DidChangeTextDocumentParams>('textDocument/didChange'),
                {
                    textDocument: {
                        uri: documentUri,
                        version: documentVersion,
                    },
                    contentChanges: [
                        {
                            text: code,
                        },
                    ],
                }
            )
            .then(() => {
                console.info(`Successfully sent text document to language server`);
                return documentVersion;
            })
            .catch((err) => {
                console.error(`Error sending text document to language server: ${err}`);
                throw err;
            });
    }
}
