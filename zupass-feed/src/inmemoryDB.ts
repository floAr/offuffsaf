import { SerializedPCD, PCD } from "@pcd/pcd-types";
import { PODPCDClaim, PODPCDProof } from "@pcd/pod-pcd";
import { ProfileCreateParams, Unlock } from "./types";
import { kv } from "@vercel/kv";


const _storedSerializedPODs = new Map<string, SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>>();
const _unlocks = new Array<Unlock>();
const _storedRawData = new Map<string, ProfileCreateParams>();


export const IsUnlocked = (sid_a: string, sid_b: string) => {
    // check bidirectional unlocks
    return _unlocks.some(u => (u.sid_a === sid_a && u.sid_b === sid_b) || (u.sid_a === sid_b && u.sid_b === sid_a));
}

export const AddUnlock = async (unlock: Unlock) => {
    if (!IsUnlocked(unlock.sid_a, unlock.sid_b))
        _unlocks.push(unlock);
    await kv.set('unlocks', JSON.stringify(_unlocks));
}

export const GetFilteredPODS = (requester_sid: string): SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>[] => {
    const unlockedPODS = new Array<SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>>();
    const allUnlocks = Array.from(_storedSerializedPODs.keys()).filter(sid => IsUnlocked(sid, requester_sid));
    // add mine
    allUnlocks.push(requester_sid);
    // try getting each serialized POD for the requester
    allUnlocks.forEach(sid => {
        const serializedPOD = _storedSerializedPODs.get(sid);
        if (serializedPOD)
            unlockedPODS.push(serializedPOD);
    });
    return unlockedPODS;
}

export const GetAllPODS = (): SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>[] => {
    return Array.from(_storedSerializedPODs.values());
}

export const GetAllRaw = (): ProfileCreateParams[] => {
    return Array.from(_storedRawData.values());
}

export const GetFilteredRaw = (sid: string): ProfileCreateParams[] => {
    var others = Array.from(_storedRawData.values()).filter(p => IsUnlocked(p.attendeeSemaphoreId, sid));
    others.push(_storedRawData.get(sid) as ProfileCreateParams);
    return others;
}

export const GetAllUnlocks = (): Unlock[] => {
    return _unlocks;
}

export const StoreProfile = async (sid: string, profile: ProfileCreateParams, serializedPod: SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>) => {
    _storedRawData.set(sid, profile);
    _storedSerializedPODs.set(sid, serializedPod);
    await kv.set('storedRawData', JSON.stringify(Object.fromEntries(_storedRawData)));
    await kv.set('storedSerializedPODs', JSON.stringify(Object.fromEntries(_storedSerializedPODs)));

}

export const ClearAll = async () => {
    _storedRawData.clear();
    _storedSerializedPODs.clear();
    _unlocks.length = 0;
    await kv.set('storedRawData', JSON.stringify(Object.fromEntries(_storedRawData)));
    await kv.set('storedSerializedPODs', JSON.stringify(Object.fromEntries(_storedSerializedPODs)));
    await kv.set('unlocks', JSON.stringify(_unlocks));
}

export const GetStats = (sid: string) => {
    const totalEntries = _storedSerializedPODs.size;
    const myUnlocks = _unlocks.filter(u => u.sid_a === sid || u.sid_b === sid).length;
    const myUnlocksPercent = myUnlocks / totalEntries * 100;
    const myConnections = _unlocks.filter(u => u.sid_a === sid || u.sid_b === sid).map(u => u.sid_a === sid ? u.sid_b : u.sid_a);
    const myUnlocksSecondDegree = _unlocks.filter(u => myConnections.includes(u.sid_a) || myConnections.includes(u.sid_b)).length;
    const myUnlocksSecondDegreePercent = myUnlocksSecondDegree / totalEntries * 100;
    return { totalEntries, myUnlocks, myUnlocksPercent, myUnlocksSecondDegree, myUnlocksSecondDegreePercent };
};


export const initialize = async () => {
    console.log('Initializing in-memory DB');
    try {

        // Start all KV get operations simultaneously
        const [storedSerializedPODsResponse, storedUnlocksResponse, storedRawDataResponse] = await Promise.all([
            kv.get('storedSerializedPODs'),
            kv.get('unlocks'),
            kv.get('storedRawData')
        ]);

        // Convert responses to JSON strings
        const storedSerializedPODs = JSON.stringify(storedSerializedPODsResponse);
        const storedUnlocks = JSON.stringify(storedUnlocksResponse);
        const storedRawData = JSON.stringify(storedRawDataResponse);

        if (storedSerializedPODs) {
            const parsedPODs = JSON.parse(storedSerializedPODs as any);
            Object.keys(parsedPODs).forEach(key => {
                _storedSerializedPODs.set(key, parsedPODs[key]);
            });
            console.log('Serialized PODs restored from Vercel KV', _storedSerializedPODs.size);
        }


        if (storedUnlocks) {
            _unlocks.push(...JSON.parse(storedUnlocks));
            console.log('Unlocks restored from Vercel KV', _unlocks.length);
        }


        if (storedRawData) {
            const parsedRawData = JSON.parse(storedRawData);
            Object.keys(parsedRawData).forEach(key => {
                _storedRawData.set(key, parsedRawData[key]);
            });
            console.log('Raw data restored from Vercel KV', _storedRawData.size);
        }

        console.log('Data restored from Vercel KV');
    } catch (error) {
        console.error('Error restoring data from Vercel KV:', error);
    }
};




