


import { ResponseData } from 'types/httpStatus';

export async function request(url: string, data?: any): Promise<ResponseData> {
    const res = await fetch(url, data);
    const result: ResponseData = await res.json();
  
    return result;
}
