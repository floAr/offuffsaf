import { SerializedPCD, PCD } from "@pcd/pcd-types";
import { PODPCDClaim, PODPCDProof } from "@pcd/pod-pcd";
import { Unlock } from "./types";

const _storedSerializedPODs = new Map<number, SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>>();
const _unlocks = new Array<Unlock>();

export const IsUnlocked = (sid_a: number, sid_b: number) => {
    // check bidirectional unlocks
    return _unlocks.some(u => (u.sid_a === sid_a && u.sid_b === sid_b) || (u.sid_a === sid_b && u.sid_b === sid_a));
}

export const AddUnlock = (unlock: Unlock) => {
    if (!IsUnlocked(unlock.sid_a, unlock.sid_b))
        _unlocks.push(unlock);
}

export const FilterPODs = (requester_sid: number): SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>[] => {
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

