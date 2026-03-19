{
  description = "Development shell for roschaefer.de";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodeVersion = "24";
        pnpmVersion = "10.22.0";
        typstVersion = "0.14.8";
        toolVersionsText = ''
          nodejs ${nodeVersion}
          pnpm ${pnpmVersion}
          typst ${typstVersion}
        '';
        syncVersionFiles = pkgs.writeShellApplication {
          name = "sync-version-files";
          runtimeInputs = [ pkgs.nodejs_24 ];
          text = ''
            printf '%s' '${toolVersionsText}' > .tool-versions

            printf '%s\n' '${nodeVersion}' > .node-version

            node --input-type=module <<'EOF'
            import fs from "node:fs";

            const packageJsonPath = "package.json";
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
            packageJson.packageManager = "pnpm@${pnpmVersion}";
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "\t") + "\n");
            EOF
          '';
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            git
            nodejs_24
            nodePackages.pnpm
            syncVersionFiles
            typst
          ];

          shellHook = ''
            sync-version-files

            export PATH="$PWD/node_modules/.bin:$PATH"

            printf 'Updated .tool-versions and .node-version from flake defaults.\n'
          '';
        };
      }
    );
}
