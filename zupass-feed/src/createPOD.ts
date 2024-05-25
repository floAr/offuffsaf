import { hash } from "crypto";
import { POD, podEntriesFromSimplifiedJSON } from "@pcd/pod";
import { PODPCD, PODPCDClaim, PODPCDPackage, PODPCDProof } from "@pcd/pod-pcd";
import { PCD, SerializedPCD } from "@pcd/pcd-types";


const createJson = (sid: BigInt, url: string, title: string, description: string) => {
    return {
        "zupass_display": "collectable",
        "zupass_image_url": `${url}`,
        "zupass_title": `${title}`,
        "zupass_description": `${description}`,
        "owner": sid,
    };
}


export const createserializedPOD = (privateKey: string, sid: BigInt, url: string, title: string, description: string): Promise<SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>> => {
    var jsonString = JSON.stringify(createJson(sid, url, title, description));
    const contentUUID = hash(jsonString, 'sha256');
    const newPOD = new PODPCD(
        contentUUID,
        POD.sign(podEntriesFromSimplifiedJSON(jsonString),
            privateKey)

    );
    return PODPCDPackage.serialize(newPOD);


}
