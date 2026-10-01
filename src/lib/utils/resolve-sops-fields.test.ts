import { describe, expect, it } from "vitest";
import { addMaskedSopsFields, resolveSopsEncryptedFields } from "./resolve-sops-fields.ts";

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

describe("addMaskedSopsFields", () => {
	it("adds the masked name next to its encrypted field and flags the entry as redacted", () => {
		expect(addMaskedSopsFields(encrypted, decrypted)).toEqual(committed);
	});

	it("adds no plain field for URLs, since a masked URL points nowhere", () => {
		const [project] = (addMaskedSopsFields(encrypted, decrypted) as typeof committed).projects;
		expect(project).not.toHaveProperty("url");
	});

	it("replaces masked fields from an earlier run, so it can run repeatedly", () => {
		const renamed = structuredClone(decrypted);
		renamed.projects[0].sopsEncryptedEntity = "Globex AG";

		const [project] = (addMaskedSopsFields(committed, renamed) as typeof committed).projects;
		expect(project.entity).toBe("Gl***AG");
		expect(addMaskedSopsFields(committed, decrypted)).toEqual(committed);
	});
});

describe("resolveSopsEncryptedFields", () => {
	it("uses the committed masked fields without decrypting in masked mode", () => {
		expect(resolveSopsEncryptedFields(committed.projects, "masked")).toEqual([
			{ id: "client-project", name: "Client project", entity: "Ac***bH", redacted: true },
			{ id: "public-project", entity: "Public Org" },
		]);
	});

	it("restores the real values in unredacted mode", () => {
		const decryptedCommitted = addMaskedSopsFields(decrypted, decrypted);

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

	it("fails in masked mode when encrypted fields were never masked, e.g. a new client", () => {
		expect(() => resolveSopsEncryptedFields(encrypted.projects, "masked")).toThrow(
			/"client-project".*pnpm mask-clients/,
		);
	});
});
