import { ListFeedsResponseValue } from "@pcd/passport-interface";
import { folderName } from "./types";

// static data for our feed registration
export const FeedRegistration: ListFeedsResponseValue = {
    providerName: "ETHBerlinHack",
    providerUrl: "https://zupass-feed.vercel.app/api/feeds",
    feeds: [
        {

            id: "1",
            name: "Zumeet",
            description: "⚠️ CLICK SUBSCRIBE BELOW! ⚠️",
            credentialRequest: {
                signatureType: "sempahore-signature-pcd"
            },
            permissions: [
                {
                    folder: folderName,
                    type: "AppendToFolder_permission"
                },
                {
                    folder: folderName,
                    type: "ReplaceInFolder_permission"
                },
                {
                    folder: folderName,
                    type: "DeleteFolder_permission"
                }
            ]
        }
    ]
}
