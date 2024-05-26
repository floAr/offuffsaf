import { Profile } from "@/profile";
import { Box, Button, Heading, Image, Text, VStack } from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ZKEdDSAEventTicketPCD } from "@pcd/zk-eddsa-event-ticket-pcd";
import useLocalStorage from "use-local-storage";
import { connect } from "@/connect";
import Link from "next/link";

export default function Connect() {
	const router = useRouter();
	const [authResult] = useLocalStorage<ZKEdDSAEventTicketPCD | null>('authResult', null);
	const [success, setSuccess] = useState(false);
	const [isClient, setIsClient] = useState(false);

	const [profile] = useLocalStorage<Profile | null>('profile', null);
	useEffect(() => {
		if (!profile) {
			// router.push('/');
		}
		setIsClient(true);
		console.info(`Profile: ${JSON.stringify(profile)}`);
	}, [profile, router]);

	const { attendeeSemaphoreId, image, name, bio } = router.query;

	const onClick = async () => {
		if (!profile) {
			throw new Error('Profile is missing');
		}

		if (!authResult?.claim.partialTicket.attendeeSemaphoreId) {
			throw new Error('attendeeSemaphoreId is missing');
		}

		if (typeof attendeeSemaphoreId !== 'string') {
			throw new Error('attendeeSemaphoreId is missing');
		}

		await connect(authResult?.claim.partialTicket.attendeeSemaphoreId, attendeeSemaphoreId);
		setSuccess(true);
	};

	return <>
		<Head>
			<title>zumeet</title>
			<meta name="description" content="Generated by create next app" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<link rel="icon" href="/favicon.ico" />
		</Head>
		<main>
			<VStack spacing={4} padding="20px">
				<VStack maxW={350} spacing={4}>
					<Heading as="h1" textStyle='h1' sx={{ fontFamily: '"Poetsen One", sans-serif' }} textTransform="lowercase">Zumeet</Heading>
					{isClient ? (
						<>
							<Box borderWidth="2px" borderColor="2px" borderRadius="12px" padding="2px">
								<VStack>
									<Heading as="h3" size="md" textTransform="uppercase" paddingTop="10px">{name}</Heading>
									<Image src={image as string} />
									<Text>{bio}</Text>
								</VStack>
							</Box>
							{success ? <>Success! <Link href="/" color="teal.500">Back to Share</Link></> : (<><Button colorScheme="teal" onClick={onClick}>Connect</Button></>)}
							<Box textAlign="center">
								After connecting, you will see each other in Zupass.
							</Box>
						</>
					) : null}
				</VStack>
			</VStack>
		</main>
	</>
}