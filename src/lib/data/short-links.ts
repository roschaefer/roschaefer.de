const shortLinkEntries = [
	["https://www.linkedin.com/in/robert-schäfer-788b8615b/", "/linkedin"],
	["https://github.com/roschaefer", "/github"],
	["https://www.youtube.com/channel/UCyrLYmvmLzWxnPHxt4n5aPw", "/youtube"],
	["https://mastodon.social/@roschaefer", "/mastodon"],
	[
		"https://signal.me/#eu/DI0Crg8ktbRKrFyKqMRVJeMO-ecjH3Xa9I6wu8QWkQRUUzGBm-lPwJh0xlrvFb00",
		"/signal",
	],
	["https://www.codementor.io/@roschaefer", "/codementor"],
	["https://www.youtube.com/watch?v=p5iMjfVCXBY", "/oss-contributors-berlin"],
	["https://www.youtube.com/watch?v=kGwGX6R70H4", "/neo4j-human-connection"],
	["https://media.ccc.de/v/35c3-9568-lightning_talks_day_4#t=1147", "/oss-contributors-35c3"],
	["https://media.ccc.de/v/35c3-9567-lightning_talks_day_3#t=5180", "/human-connection-35c3"],
	["https://www.youtube.com/watch?v=fzTmJBo4R5A", "/informatikradar"],
	[
		"https://www.youtube.com/watch?v=oWNqLev23AQ&list=PL1CiawkXA01NeLHG2QNHmtACrb_brDodm",
		"/story-trolley-talk",
	],
] as const;

export const shortLinks = Object.fromEntries(shortLinkEntries);
export const shortLinkDomain = "roschaefer.de";

export const printLinkLabel = (href: string): string => {
	const alias = shortLinks[href];
	return alias ? `${shortLinkDomain}${alias}` : href;
};
