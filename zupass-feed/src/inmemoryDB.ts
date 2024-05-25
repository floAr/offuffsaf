import { SerializedPCD, PCD } from "@pcd/pcd-types";
import { PODPCDClaim, PODPCDProof } from "@pcd/pod-pcd";
import { ProfileCreateParams, Unlock } from "./types";

const _storedSerializedPODs = new Map<string, SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>>();
const _unlocks = new Array<Unlock>();
const _storedRawData = new Map<string, ProfileCreateParams>();

export const IsUnlocked = (sid_a: string, sid_b: string) => {
    // check bidirectional unlocks
    return _unlocks.some(u => (u.sid_a === sid_a && u.sid_b === sid_b) || (u.sid_a === sid_b && u.sid_b === sid_a));
}

export const AddUnlock = (unlock: Unlock) => {
    if (!IsUnlocked(unlock.sid_a, unlock.sid_b))
        _unlocks.push(unlock);
}

export const FilterPODs = (requester_sid: string): SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>[] => {
    const unlockedPODS = new Array<SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>>();
    const allUnlocks = Array.from(_storedSerializedPODs.keys()).filter(sid => IsUnlocked(sid, requester_sid));
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

export const StoreProfile = (sid: string, profile: ProfileCreateParams, serializedPod: SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>) => {
    _storedRawData.set(sid, profile);
    _storedSerializedPODs.set(sid, serializedPod);
}


