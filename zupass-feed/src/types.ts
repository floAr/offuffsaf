// unlock type

export type Unlock = {
    sid_a: string,
    sid_b: string
}

export type ProfileCreateParams = {
    attendeeSemaphoreId: string;
    url: string;
    title?: string;
    description?: string;
}


export type UnlockRequestParams = {
    attendeeSemaphoreIdA: string;
    attendeeSemaphoreIdB: string;
}


export const folderName = "ETHBerlin-ZuMeet";