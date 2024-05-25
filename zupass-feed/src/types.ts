// Unlocks are biredirectional access rights, so sid_a can access sid_b and vice versa
export type Unlock = {
    sid_a: string,
    sid_b: string
}

// Requet params from the client application
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

// constant to stop messing up with the folder name
export const folderName = "ETHBerlin-Zumeet";