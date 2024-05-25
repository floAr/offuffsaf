const connect = async (attendeeSemaphoreIdA: string, attendeeSemaphoreIdB: string) => {
	const params = {
		attendeeSemaphoreIdA,
		attendeeSemaphoreIdB,
	};
	console.info(`Connecting profiles for ${JSON.stringify(params)}`);
	const reponse = await fetch(`${process.env.NEXT_PUBLIC_FEED_SERVICE}/unlock`, {
		body: JSON.stringify(params),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		}
	});

	if (!reponse.ok) {
		throw new Error(`Failed to connect profiles with status ${reponse.status} and text: ${await reponse.text()}`);
	}

	const data = await reponse.json();

	console.info(`Profiles connected with data: ${JSON.stringify(data)}`);
}

export {
	connect,
};