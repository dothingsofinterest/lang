/* Base Response */
interface Response {
    code: number;
    message: string;
    data: any;
}
export type { Response };
/* Base Response */

/* AUTH */
interface RequestDataLogin {
    username: string;
    password: string;
    code: number;
    uuid: string;
}

interface RequestDataLoginSimple {
    username: string;
    password: string;
}

interface RequestDataUpdatePassword {
    oldPassword: string;
    newPassword: string;
}

export type { RequestDataLogin, RequestDataLoginSimple, RequestDataUpdatePassword };
/* AUTH */

/* TTS */
interface RequestParamsTts {
    id?: number;
    content: string;
    type: number;
}

export type { RequestParamsTts };
/* TTS */
