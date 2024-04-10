
export const enum ROBOT_NAME_VALUE {
    DING_TALK = 'dingtalk'
} 

export const AGENTCRAFT_CLIENT_ACCESS_LOCALSTORAGE = "agentcraft_client_access_robot";

export const DEFAULT_CLIENT_ACCESS_REGION = 'cn-hangzhou';
export const AGENTCRAFT_CLIENT_PREFIX = 'AGENTCRAFT_CLIENT';

export const AGENTCRAFT_CLIENT_DINGTALK = 'agentcraft-client-dingtalk';


export const enum ROBOT_CONFIG_STEP {
    AGENT_SERVICE = 0,
    SERVICE_CONFIG_PREVIEW = 1,
    ROBOT_WEBHOOK = 2
}

export const AGENTCRAFT_BUS_NAME = 'AGENTCRAFT_BUS';


export const CLIENTACCESS_NAME_MAP:any = {
    [AGENTCRAFT_CLIENT_DINGTALK]: '钉钉机器人',
}