export const docsSite = "https://roschaefer.github.io/git-splice";
export const localDocsSite = "http://localhost:3000/git-splice";

/** Points links to the git-splice docs at another copy of the site, e.g. one served locally. */
export const rehypeDocsLinks =
	({ site }) =>
	(tree) => {
		const visit = (node) => {
			const href = node.properties?.href;
			if (typeof href === "string" && (href === docsSite || href.startsWith(`${docsSite}/`))) {
				node.properties.href = site + href.slice(docsSite.length);
			}
			for (const child of node.children ?? []) visit(child);
		};
		visit(tree);
	};
