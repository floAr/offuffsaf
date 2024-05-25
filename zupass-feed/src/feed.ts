import { ListFeedsResponseValue } from "@pcd/passport-interface";
import { folderName } from "./types";

export const FeedRegistration: ListFeedsResponseValue = {
    providerName: "ETHBerlinHack",
    providerUrl: "https://zupass-feed.vercel.app/api/feeds",
    feeds: [
        {

            id: "1",
            name: "Zumeet",
            description: "Zumeet let's you connect with other participants by exchanging your event profile with each other, in three simple steps!",
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
