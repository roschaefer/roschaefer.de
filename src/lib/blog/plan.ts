export const publicationPlan: string[] = [
	"motivation",
	"submodule-problems",
	"subtree-problems",
	"lessons-learned",
	"naming",
	"bdd-scrut",
	"bdd-drawings",
	"bdd-ai",
	"three-way-merge",
	"sync-state",
	"sync-log",
	"separate-histories",
	"pulling-commits",
	"upstream",
	"remote-boundary",
	"upstream-worktree",
	"rebuilt-commit",
	"rebuilt-commit-worktree",
	"nesting",
	"splice-identity",
	"mirror-semantics",
	"weak-parent",
	"splicing-scrut",
	"contributing-scrut",
	"git-subrepo",
	"sapling",
	"jj",
];

export const plannedPosition = (id: string) => {
	const position = publicationPlan.indexOf(id);
	return position === -1 ? publicationPlan.length : position;
};
