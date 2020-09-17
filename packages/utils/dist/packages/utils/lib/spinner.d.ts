import ora, { Options, Ora } from 'ora';
export declare class Spinner {
    _spinner: Ora;
    constructor(options: Options | string);
    step(txt: string): void;
    clear(): ora.Ora;
    stop(): void;
    succeed(txt: string): void;
    fail(txt: string): void;
}
export default Spinner;
//# sourceMappingURL=spinner.d.ts.map