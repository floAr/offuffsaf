### The problem Zumeet solves
Find it hard to socialize at hackathons?

Too shy to break the ice?

Just use Zumeet – the perfect conversation starter with a gamified twist to help you meet new people and collect lasting memories!

Get started now: [https://zumeet.pages.dev/](https://zumeet.pages.dev/)
[Pitchdeck](https://docs.google.com/presentation/d/1HNuD7O_F8Wq5RBFvafbyJSb_sYgyOwrmSLWnZ08WX48/edit?pli=1)
[Videos](https://drive.google.com/file/d/1dhKkAdsGQ4W7ac3vqkXcv7IAqSVffkjT/view?usp=sharing)

### The Zumeet Approach
Zumeet allows event participant to create a personalized digitalized artifact. Those artifacts can be exchanged between participants by meeting in person and sharing their Zupass public identity with each other. 
Collected artifacts are stored in the Zupass application under an event specific folder. 

Event organizers can access the social graph to gather insights. This can be used to identify social clusters, well connected people in the social peer group, as well as deriving inforamtion about the social strucutre of the group of event attendees. This allows to direct decision on social acitvations to facility better networking.

watch ETHBerlin04 social graph evolve here: [Social Graph](https://zupass-feed.vercel.app/graph)

![Nascend Social graph](https://github.com/floAr/offuffsaf/blob/main/NascentSocialGraph.png)

Given the zk proofing ability on Zupass over the stored PODs one could build digital experiences on top of that, like a website, only accessible by participants I have connected with. 

### Challenges you ran into
There was no prior Zupass experience in the team, so it took a bit of time to adjust our mental model to make it work well with the project. 

Our inital approach intented to work soley P2P, but due to limitations with the current Zupass implementation we impelemented a feed server to facicility distributation of PCDs and claim management.

There were some hiccups integrating with Zupass, as well as blindspots on our side how to approach certain things like creating PCDs from a feed server. Thanks to the fantastic support of the Zupass team / mentors those problems were turned into learnings, instead of blockers.


### Technology used

![schema](https://github.com/floAr/offuffsaf/blob/main/Schema.png)

#### Frontend / Client
* Next / React
* Zupass api to create PODs and store them as PCD in the Zupass app
* Zupass auth flow to verify event attendance


#### Backend / Feed-Server
* Express server on Vercel
* Generic Key / Value store to persist data between sessions
* D3 to generate a vizualisation of the events social graph
