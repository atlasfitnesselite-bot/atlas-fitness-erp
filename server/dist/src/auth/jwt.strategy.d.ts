import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: any): {
        id: any;
        deviceCode: any;
        type: string;
        email?: undefined;
        roles?: undefined;
    } | {
        id: any;
        email: any;
        roles: any;
        deviceCode?: undefined;
        type?: undefined;
    };
}
export {};
