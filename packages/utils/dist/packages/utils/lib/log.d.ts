declare enum Types {
    info = "info",
    warn = "warn",
    error = "error",
    done = "done"
}
declare type LogFnType = (msg: any, tag?: string) => void;
interface LogType {
    [Types.info]: LogFnType;
    [Types.warn]: LogFnType;
    [Types.error]: LogFnType;
    [Types.done]: LogFnType;
}
export declare const log: LogType;
export default log;
//# sourceMappingURL=log.d.ts.map