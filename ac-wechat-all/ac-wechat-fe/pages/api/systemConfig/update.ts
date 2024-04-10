import type { NextApiRequest, NextApiResponse } from 'next'
import { ServerlessBridgeService } from 'infra/alibaba-cloud/services/serverless-app';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const headers = req.headers;
    const mainAccountId: any = process.env.FC_ACCOUNT_ID || headers['x-fc-account-id'];
    const accessKeyId: any = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || headers['x-fc-access-key-id'];
    const accessKeySecret: any = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || headers['x-fc-access-key-secret'];
    const securityToken: any = process.env.ALIBABA_CLOUD_SECURITY_TOKEN || headers['x-fc-security-token'];
    const autoReply = req.body;
    console.log(autoReply);
    let credential = undefined;
    if (accessKeyId) {
        credential = {
            accessKeyId,
            accessKeySecret,
            securityToken
        }
    }
    const serverlessBridgeService = new ServerlessBridgeService(credential, mainAccountId);

    let status = 200;
    const response: any = {
        code: 200,
    }

    const functionName = process.env.beFunctionName || '';
    try {
        const result = await serverlessBridgeService.getFunctionV3(functionName);
        const functionInfo = result?.body || {};
        const environmentVariables = functionInfo.environmentVariables;
        const completeEnvs = Object.assign({}, environmentVariables, autoReply);
        const updateResult = await serverlessBridgeService.updateFunctionV3(functionName, {
            environmentVariables: completeEnvs
        });
        response.data = updateResult.body;
    } catch (e: any) {
        status = 500;
        response.code = status;
        response.error = e.message
    }
    
    res.status(status).json(response);
}
