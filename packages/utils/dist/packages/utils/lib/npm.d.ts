declare type NpmConfig = {
    registry: string;
    username: string;
    email: string;
};
declare type NpmTagType = {
    list: (pkg: string) => string;
    add: (pkg: string, version: string, tag: string) => string;
    remove: (pkg: string, tag: string) => string;
};
export interface NmpClientType {
    readonly version: string;
    readonly config: NpmConfig;
    readonly tag: NpmTagType;
    setConfig: (key: string, value: string) => NpmConfig;
    addDistTag: NpmTagType['add'];
}
export declare const npmClient: NmpClientType;
export default npmClient;
//# sourceMappingURL=npm.d.ts.map