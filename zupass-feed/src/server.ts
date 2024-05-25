import express, { json } from 'express';
import cors from 'cors';
import { ListFeedsResponseValue, PollFeedRequest, PollFeedResponseValue } from '@pcd/passport-interface';
import { RSAImagePCD, prove, serialize } from "@pcd/rsa-image-pcd"
import { ArgumentTypeName, PCD } from '@pcd/pcd-types';
import { SemaphoreSignaturePCDPackage } from '@pcd/semaphore-signature-pcd';
import NodeRSA from 'node-rsa';
import { FeedRegistration } from './feed';
import { ProfileCreateParams, UnlockRequestParams } from './types'
import { AddUnlock, GetAllPODS, StoreProfile } from './inmemoryDB';
import { createSerializedPOD } from './createPOD';


const app = express();
const port = process.env.PORT || 3000;

// Configure CORS to allow requests from zupass.org and localhost
const whitelist = ['https://zupass.org', 'http://localhost:3001'];
const corsOptions = {
    origin: function (origin: any, callback: any) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions));
app.use(express.json());


// Key borrowed from https://github.com/iden3/circomlibjs/blob/4f094c5be05c1f0210924a3ab204d8fd8da69f49/test/eddsa.js#L103
export const EXAMPLE_EDDSA_PRIVATE_KEY =
    "0001020304050607080900010203040506070809000102030405060708090001";

// Endpoint to get the feed
app.get('/api/feeds', (req, res) => {
    res.status(200).json(FeedRegistration);
});



app.post('/profile', async (req, res) => {
    var creationParameters: ProfileCreateParams = req.body;
    console.log(`Creating profile for ${JSON.stringify(creationParameters)}`);
    var serializedPOD = await createSerializedPOD(EXAMPLE_EDDSA_PRIVATE_KEY, creationParameters.attendeeSemaphoreId, creationParameters.url, creationParameters.title, creationParameters.description);
    StoreProfile(creationParameters.attendeeSemaphoreId, creationParameters, serializedPOD);
    res.status(200).json({ success: true });
});

app.post('/unlock', async (req, res) => {
    var creationParameters: UnlockRequestParams = req.body;
    console.log(`Unlocking ${JSON.stringify(creationParameters)}`);
    AddUnlock({ sid_a: creationParameters.attendeeSemaphoreIdA, sid_b: creationParameters.attendeeSemaphoreIdB });
    res.status(200).json({ success: true });
});


app.post('/api/feeds', async (req, res) => {
    var request: PollFeedRequest = req.body;
    var allSPods = GetAllPODS();
    var result: PollFeedResponseValue = {
        actions: []
    };

    result.actions.push({ folder: "ETHBerlin-Game", type: "AppendToFolder_action", pcds: allSPods });

    // 
    // const sig = await SemaphoreSignaturePCDPackage.deserialize(request.pcd as any);
    // // sig.claim.identityCommitment == public key of requester
    // // return all pcds that belong to sig.claim.identityCommitment
    // var pcd = await createPCD("http://test.com/1.png", "test");
    // const resp = await pcdResponse(pcd);
    res.status(200).json(result);
});

app.get('/dev/prefill', async (req, res) => {
    // generate some random profiles
    const profile1: ProfileCreateParams = {
        attendeeSemaphoreId: "0x1234",
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Variegated_golden_frog_%28Mantella_baroni%29_Ranomafana.jpg/2560px-Variegated_golden_frog_%28Mantella_baroni%29_Ranomafana.jpg",
        title: "Frog",
        description: "A frog"
    };

    const profile1POD = await createSerializedPOD(EXAMPLE_EDDSA_PRIVATE_KEY, profile1.attendeeSemaphoreId, profile1.url, profile1.title, profile1.description);

    const profile2: ProfileCreateParams = {
        attendeeSemaphoreId: "0x5678",
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Gull_portrait_ca_usa.jpg/2560px-Gull_portrait_ca_usa.jpg",
        title: "Bird",
        description: "A bird"
    };

    const profile2POD = await createSerializedPOD(EXAMPLE_EDDSA_PRIVATE_KEY, profile2.attendeeSemaphoreId, profile2.url, profile2.title, profile2.description);

    const profile3: ProfileCreateParams = {
        attendeeSemaphoreId: "0x9abc",
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Red_Kangaroo.jpg/2560px-Red_Kangaroo.jpg",
        title: "Kangaroo",
        description: "A kangaroo"
    };

    const profile3POD = await createSerializedPOD(EXAMPLE_EDDSA_PRIVATE_KEY, profile3.attendeeSemaphoreId, profile3.url, profile3.title, profile3.description);

    StoreProfile(profile1.attendeeSemaphoreId, profile1, profile1POD);
    StoreProfile(profile2.attendeeSemaphoreId, profile2, profile2POD);
    StoreProfile(profile3.attendeeSemaphoreId, profile3, profile3POD);

    res.status(200).json({ success: true });
});



// Start the server
app.listen(port, () => {
    console.log(`Zupass feed server running at http://localhost:${port}`);
});

module.exports = app;
