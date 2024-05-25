export type ProfileCreateParams = {
	attendeeSemaphoreId: string;
	url: string;
	title?: string;
	description?: string;
}

const createProfile = async (params: ProfileCreateParams) => {
	console.info(`Creating profile for ${JSON.stringify(params)}`);
	const reponse = await fetch(`${process.env.NEXT_PUBLIC_FEED_SERVICE}/profile`, {
		body: JSON.stringify(params),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		}
	});

	if (!reponse.ok) {
		throw new Error(`Failed to create profile with status ${reponse.status} and text: ${await reponse.text()}`);
	}

	const data = await reponse.json();

	console.info(`Profile created with data: ${JSON.stringify(data)}`);
}

export {
	createProfile,
};