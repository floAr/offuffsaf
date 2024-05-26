import express, { Request, Response } from 'express';
import cors from 'cors';
import { PollFeedRequest, PollFeedResponseValue } from '@pcd/passport-interface';
import { FeedRegistration } from './feed';
import { ProfileCreateParams, UnlockRequestParams, folderName } from './types'
import { AddUnlock, ClearAll, GetAllPODS, GetAllUnlocks, GetFilteredPODS, GetStats, StoreProfile, initialize } from './inmemoryDB';
import { createSerializedPOD } from './createPOD';
import { SemaphoreSignaturePCDPackage } from '@pcd/semaphore-signature-pcd';
import { graphBuilder } from './graph';

// Init express app and cors
const app = express();
const port = process.env.PORT || 3000;

// Configure CORS to allow requests from zupass.org and localhost
const whitelist = ['https://zupass.org', 'http://localhost:3001', 'https://zumeet.pages.dev'];
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

// Endpoint to get the feed, used for feed discovery from zupass.org
app.get('/api/feeds', (req, res) => {
    res.status(200).json(FeedRegistration);
});


// Polling a subscriped feed
app.post('/api/feeds', async (req, res) => {
    // parse out the identity from the request
    const request: PollFeedRequest = req.body;
    var parsed = JSON.parse(request.pcd!.pcd);
    const sig = await SemaphoreSignaturePCDPackage.deserialize(request.pcd!.pcd);
    var allSPods = GetFilteredPODS(sig.claim.identityCommitment);
    var result: PollFeedResponseValue = {
        actions: []
    };
    // clear the feed, without this Zupass.org will not update
    result.actions.push({ folder: folderName, type: "DeleteFolder_action", recursive: false });

    // add all pcds to the feed
    result.actions.push({ folder: folderName, type: "AppendToFolder_action", pcds: allSPods });

    res.status(200).json(result);
});

// api endpoint to register a profile
app.post('/profile', async (req, res) => {
    var creationParameters: ProfileCreateParams = req.body;
    var serializedPOD = await createSerializedPOD(EXAMPLE_EDDSA_PRIVATE_KEY, creationParameters.attendeeSemaphoreId, creationParameters.url, creationParameters.title, creationParameters.description);
    await StoreProfile(creationParameters.attendeeSemaphoreId, creationParameters, serializedPOD);
    res.status(200).json({ success: true });
});

// api endpoint to register an unlock
app.post('/unlock', async (req, res) => {
    var creationParameters: UnlockRequestParams = req.body;
    await AddUnlock({ sid_a: creationParameters.attendeeSemaphoreIdA, sid_b: creationParameters.attendeeSemaphoreIdB });
    res.status(200).json({ success: true });
});

app.get('/graph', graphBuilder);

// dev endpoints to make our hackathon life a tiinyyyy bit easier
// pull dev password from env DEV_PASSWORD
const devPassword = process.env.DEV_PASSWORD;

const protectDevRoutes = (req: Request, res: Response) => {
    if (req.query.password === devPassword) {
        return true;
    } else {
        res.status(401).send('Unauthorized');
        return false;
    }
}

// generate mock profiles
app.get('/dev/prefill', async (req, res) => {
    if (!protectDevRoutes(req, res)) {
        return;
    }
    // generate some random profiles
    const profile1: ProfileCreateParams = {
        attendeeSemaphoreId: "0x1",
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Variegated_golden_frog_%28Mantella_baroni%29_Ranomafana.jpg/2560px-Variegated_golden_frog_%28Mantella_baroni%29_Ranomafana.jpg",
        title: "Frog",
        description: "A frog"
    };

    const profile1POD = await createSerializedPOD(EXAMPLE_EDDSA_PRIVATE_KEY, profile1.attendeeSemaphoreId, profile1.url, profile1.title, profile1.description);

    const profile2: ProfileCreateParams = {
        attendeeSemaphoreId: "0x2",
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Gull_portrait_ca_usa.jpg/2560px-Gull_portrait_ca_usa.jpg",
        title: "Bird",
        description: "A bird"
    };

    const profile2POD = await createSerializedPOD(EXAMPLE_EDDSA_PRIVATE_KEY, profile2.attendeeSemaphoreId, profile2.url, profile2.title, profile2.description);

    const profile3: ProfileCreateParams = {
        attendeeSemaphoreId: "0x3",
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

// add a custom unlock
app.get('/dev/unlock', async (req, res) => {
    if (!protectDevRoutes(req, res)) {
        return;
    }
    const queryParams = req.query;
    await AddUnlock({ sid_a: queryParams.sid_a as string, sid_b: queryParams.sid_b as string });
    res.status(200).json({ success: true });
});

// clear everything
app.get('/dev/purge', async (req, res) => {
    if (!protectDevRoutes(req, res)) {
        return;
    }
    await ClearAll();
    res.status(200).json({ success: true });
});

// get a view of the current state
app.get('/dev/all', async (req, res) => {
    if (!protectDevRoutes(req, res)) {
        return;
    }
    // check if there is a sid query parameter
    const queryParams = req.query;
    var filtered: any[] = [];
    if (queryParams.sid) {
        filtered = GetFilteredPODS(queryParams.sid as string);
    }

    var allSPods = GetAllPODS();
    var allUnlocks = GetAllUnlocks();
    var result: PollFeedResponseValue = {
        actions: []
    };

    result.actions.push({ folder: folderName, type: "AppendToFolder_action", pcds: allSPods });

    res.status(200).json({ allSPods, allUnlocks, filtered });
});

// debug stats , showing total profiles and your reach within the network
app.get('/dev/stats', async (req, res) => {
    if (!protectDevRoutes(req, res)) {
        return;
    }
    const queryParams = req.query;

    if (queryParams.sid) {
        res.status(200).json({ stats: GetStats(queryParams.sid as string) });
    }
    else
        res.status(200).json({});
});




initialize().then(() => {
    console.error(GetStats("0x1"));
    // Start the server
    app.listen(port, () => {
        console.error(`Zupass feed server running at http://localhost:${port}`);
    });
})

module.exports = app;
