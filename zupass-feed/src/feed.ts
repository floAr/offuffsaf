import { ListFeedsResponseValue } from "@pcd/passport-interface";

export const FeedRegistration: ListFeedsResponseValue = {
    providerName: "ETHBerlinHack",
    providerUrl: "https://zupass-feed.vercel.app/api/feeds",
    feeds: [
        {

            id: "1",
            name: "ETHBERLN HACK",
            description: "Hack the Hell away!",
            credentialRequest: {
                signatureType: "sempahore-signature-pcd"
            },
            permissions: [
                {
                    folder: "ETHBerlin-Game",
                    type: "AppendToFolder_permission"
                },
                {
                    folder: "ETHBerlin-Game",
                    type: "ReplaceInFolder_permission"
                },
                {
                    folder: "ETHBerlin-Game",
                    type: "DeleteFolder_permission"
                }
            ]
        }
    ]
}
