export const maskEntity = (name: string): string => {
	if (name.length <= 6) {
		return "***";
	}

	return `${name.slice(0, 2)}***${name.slice(-2)}`;
};
