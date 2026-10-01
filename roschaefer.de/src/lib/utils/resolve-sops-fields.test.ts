import { describe, expect, it } from "vitest";
import { addRedactedSopsFields, resolveSopsEncryptedFields } from "./resolve-sops-fields.ts";

// Synthetic fixtures. Never use real client names here - this file is public.
const decrypted = {
	projects: [
		{
			id: "client-project",
			name: "Client project",
			sopsEncryptedEntity: "Acme Consulting GmbH",
			sopsEncryptedUrl: "https://acme.example",
		},
		{ id: "public-project", entity: "Public Org" },
	],
};

const encrypted = {
	projects: [
		{
			id: "client-project",
			name: "Client project",
			sopsEncryptedEntity: "ENC[entity]",
			sopsEncryptedUrl: "ENC[url]",
		},
		{ id: "public-project", entity: "Public Org" },
	],
	sops: { mac: "ENC[mac]" },
};

const committed = {
	projects: [
		{
			id: "client-project",
			name: "Client project",
			entity: "Ac***bH",
			sopsEncryptedEntity: "ENC[entity]",
			sopsEncryptedUrl: "ENC[url]",
			redacted: true,
		},
		{ id: "public-project", entity: "Public Org" },
	],
	sops: { mac: "ENC[mac]" },
};

describe("addRedactedSopsFields", () => {
	it("adds the redacted name next to its encrypted field and flags the entry as redacted", () => {
		expect(addRedactedSopsFields(encrypted, decrypted)).toEqual(committed);
	});

	it("adds no plain field for URLs, since a redacted URL points nowhere", () => {
		const [project] = (addRedactedSopsFields(encrypted, decrypted) as typeof committed).projects;
		expect(project).not.toHaveProperty("url");
	});

	it("replaces redacted fields from an earlier run, so it can run repeatedly", () => {
		const renamed = structuredClone(decrypted);
		renamed.projects[0].sopsEncryptedEntity = "Globex AG";

		const [project] = (addRedactedSopsFields(committed, renamed) as typeof committed).projects;
		expect(project.entity).toBe("Gl***AG");
		expect(addRedactedSopsFields(committed, decrypted)).toEqual(committed);
	});
});

describe("resolveSopsEncryptedFields", () => {
	it("uses the committed redacted fields without decrypting in redacted mode", () => {
		expect(resolveSopsEncryptedFields(committed.projects, "redacted")).toEqual([
			{ id: "client-project", name: "Client project", entity: "Ac***bH", redacted: true },
			{ id: "public-project", entity: "Public Org" },
		]);
	});

	it("restores the real values in unredacted mode", () => {
		const decryptedCommitted = addRedactedSopsFields(decrypted, decrypted);

		expect(resolveSopsEncryptedFields(decryptedCommitted, "unredacted")).toEqual({
			projects: [
				{
					id: "client-project",
					name: "Client project",
					entity: "Acme Consulting GmbH",
					url: "https://acme.example",
				},
				{ id: "public-project", entity: "Public Org" },
			],
		});
	});

	it("fails in redacted mode when encrypted fields were never redacted, e.g. a new client", () => {
		expect(() => resolveSopsEncryptedFields(encrypted.projects, "redacted")).toThrow(
			/"client-project".*pnpm redact-clients/,
		);
	});
});
