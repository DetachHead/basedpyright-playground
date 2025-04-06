/*
 * Copyright (c) Eric Traut
 * Represents a single session of the playground. A session represents
 * an instantiated language server. Sessions persists across API calls for
 * performance reasons.
 */


export interface SessionOptions {
    pythonVersion?: string;
    pythonPlatform?: string;
    pyrightVersion?: string;
    typeCheckingMode?: string;
    configOverrides?: { [name: string]: boolean };
    locale?: string;
}
