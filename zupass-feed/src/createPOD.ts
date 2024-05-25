import crypto from "crypto";
import { POD, podEntriesFromSimplifiedJSON } from "@pcd/pod";
import { PODPCD, PODPCDClaim, PODPCDPackage, PODPCDProof } from "@pcd/pod-pcd";
import { PCD, SerializedPCD } from "@pcd/pcd-types";


const createJson = (sid: string, url: string, title: string | undefined, description: string | undefined) => {
    var jobject: any = {
        "zupass_display": "collectable",
        "zupass_image_url": `${url}`
    }
    if (title) {
        jobject["zupass_title"] = `${title}`
    }
    if (description) {
        jobject["zupass_description"] = `${description}`
    }
    jobject["owner"] = sid;

    return jobject;
}


export const createSerializedPOD = (privateKey: string, sid: string, url: string, title: string | undefined, description: string | undefined): Promise<SerializedPCD<PCD<PODPCDClaim, PODPCDProof>>> => {
    var jsonString = JSON.stringify(createJson(sid, url, title, description));

    const hash = crypto.createHash('sha256');
    hash.update(jsonString);
    const contentUUID = hash.digest('hex');

    const newPOD = new PODPCD(
        contentUUID,
        POD.sign(podEntriesFromSimplifiedJSON(jsonString),
            privateKey)

    );
    return PODPCDPackage.serialize(newPOD);


}
