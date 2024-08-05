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


interface DiagnosticRequest {
    callback: (diags: Diagnostic[], error?: Error) => void;
}

const rootPath = '/src/'

const rootUri = `file://${rootPath}`

const fileName = 'Untitled.py'

const documentUri = rootUri + fileName

const workerScriptName = "worker.js";

export class LspClient {
    public connection: MessageConnection;
    public onNotification: (diagnostics:  Diagnostic[]) => void
    private _documentVersion = 1;
    private _documentText = '';
    private _documentDiags: PublishDiagnosticsParams | undefined;
    private _pendingDiagRequests = new Map<number, DiagnosticRequest[]>();

    constructor() {
        const workerScript = `./${workerScriptName}`;
        const foreground = new Worker(workerScript, {
            name: 'Pyright-foreground',
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
    }

    public updateCode = (code: string) => [
        this._documentText = code
    ]

    public async initialize(sessionOptions?: SessionOptions) {
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
                files: {[rootPath + fileName]: this._documentText, [rootPath+'pyrightconfig.json']: JSON.stringify({typeshedPath: '/typeshed'})}
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

                // Update the cached diagnostics.
                if (
                    this._documentDiags === undefined ||
                    this._documentDiags.version! < diagVersion
                ) {
                    this._documentDiags = diagInfo;
                }

                // Resolve any pending diagnostic requests.
                const pendingRequests = this._pendingDiagRequests.get(diagVersion) ?? [];
                this._pendingDiagRequests.delete(diagVersion);
                this.onNotification(diagInfo.diagnostics)
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
    }

    async getDiagnostics(code: string): Promise<Diagnostic[]> {
        const codeChanged = this._documentText !== code;

        // If the code hasn't changed since the last time we received
        // a code update, return the cached diagnostics.
        if (!codeChanged && this._documentDiags) {
            return this._documentDiags.diagnostics;
        }

        // The diagnostics will come back asynchronously, so
        // return a promise.
        return new Promise<Diagnostic[]>(async (resolve, reject) => {
            let documentVersion = this._documentVersion;

            if (codeChanged) {
                documentVersion = await this.updateTextDocument(code);
            }

            // Queue a request for diagnostics.
            let requestList = this._pendingDiagRequests.get(documentVersion);
            if (!requestList) {
                requestList = [];
                this._pendingDiagRequests.set(documentVersion, requestList);
            }

            requestList.push({
                callback: (diagnostics, err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    console.info(`Diagnostic callback ${JSON.stringify(diagnostics)}}`);
                    resolve(diagnostics);
                },
            });
        });
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
    private async updateTextDocument(code: string): Promise<number> {
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

    // Cancels all pending requests.
    cancelRequests() {
        this._pendingDiagRequests.forEach((requestList) => {
            requestList.forEach((request) => {
                request.callback([], new Error('Request canceled'));
            });
        });

        this._pendingDiagRequests.clear();
    }

    private static _logServerData(data: any) {
        console.info(
            `Logged from basedpyright language server: ${
                typeof data === 'string' ? data : data.toString('utf8')
            }`
        );
    }
}
