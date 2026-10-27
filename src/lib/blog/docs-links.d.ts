type Node = { properties?: { href?: unknown }; children?: Node[] };

export const docsSite: string;
export const localDocsSite: string;
export const rehypeDocsLinks: (options: { site: string }) => (tree: Node) => void;
