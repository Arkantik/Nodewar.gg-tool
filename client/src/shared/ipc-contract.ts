export type LoggerMode = "sniff" | "open_file" | "status" | "update" | "record" | "analyze";

export interface LoggerEvent {
  sessionId: string;
  kind: "stdout" | "stderr" | "exit";
  data: string;
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface OpenFileOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
}

export interface SaveFileOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
}

export type UpdaterEvent =
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "not-available" }
  | { status: "downloading"; percent: number }
  | { status: "downloaded"; version: string }
  | { status: "error"; message: string };

export interface IpcApi {
  logger: {
    start: (mode: LoggerMode, extraArgs?: string[]) => Promise<{ sessionId: string }>;
    stop: (sessionId: string) => Promise<void>;
    onEvent: (cb: (evt: LoggerEvent) => void) => () => void;
  };
  dialog: {
    openFile: (options?: OpenFileOptions) => Promise<string[] | null>;
    saveFile: (options?: SaveFileOptions) => Promise<string | null>;
  };
  fs: {
    readTextFile: (path: string) => Promise<string>;
    writeFile: (path: string, contents: string) => Promise<void>;
  };
  clipboard: {
    writeText: (text: string) => Promise<void>;
  };
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
  config: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
  };
  updater: {
    check: () => Promise<void>;
    download: () => Promise<void>;
    onEvent: (cb: (evt: UpdaterEvent) => void) => () => void;
  };
  app: {
    getVersion: () => Promise<string>;
    exit: () => Promise<void>;
  };
}
