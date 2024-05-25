import express from 'express';
import cors from 'cors';
import { ListFeedsResponseValue, PollFeedRequest } from '@pcd/passport-interface';
import { RSAImagePCD, prove, serialize } from "@pcd/rsa-image-pcd"
import { ArgumentTypeName, PCD } from '@pcd/pcd-types';
import { SemaphoreSignaturePCDPackage } from '@pcd/semaphore-signature-pcd';
import NodeRSA from 'node-rsa';


const app = express();
const port = process.env.PORT || 3000;

// Configure CORS to allow requests from zupass.org
const corsOptions = {
    origin: 'https://zupass.org',
    optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

const response: ListFeedsResponseValue = {
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

// Endpoint to get the feed
app.get('/api/feeds', (req, res) => {
    res.status(200).json(response);
});

const key = new NodeRSA({ b: 2048 });
const exportedKey = key.exportKey("private");

const createPCD = async (url: string, title: string) => {
    const pcd = await prove({
        id: {
            argumentType: ArgumentTypeName.String,
            value: undefined
        },
        privateKey: {
            argumentType: ArgumentTypeName.String,
            value: exportedKey
        },
        url: {
            argumentType: ArgumentTypeName.String,
            value: url
        },
        title: {
            argumentType: ArgumentTypeName.String,
            value: title
        }
    })
    return pcd;
}


const pcdResponse = async (pcds: RSAImagePCD) => {
    const serialized = await serialize(pcds);
    return {
        actions: [
            {
                pcds: [
                    serialized
                ],
                folder: "ETHBerlin-Game",
                type: "AppendToFolder_action"
            }
        ]
    }
}

app.post('/api/feeds', async (req, res) => {
    var request: PollFeedRequest = req.body;
    // 
    const sig = await SemaphoreSignaturePCDPackage.deserialize(request.pcd as any);
    // sig.claim.identityCommitment == public key of requester
    // return all pcds that belong to sig.claim.identityCommitment
    var pcd = await createPCD("http://test.com/1.png", "test");
    const resp = await pcdResponse(pcd);
    res.status(200).json(resp);
});

// Start the server
app.listen(port, () => {
    console.log(`Zupass feed server running at http://localhost:${port}`);
});
