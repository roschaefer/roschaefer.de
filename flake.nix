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
        playwrightBrowsers = pkgs.playwright-driver.browsers;
        node = pkgs.nodejs_24;
        pnpm = pkgs.pnpm;
        typst = pkgs.typst;
        toolVersionsText = ''
          nodejs ${node.version}
          pnpm ${pnpm.version}
          typst ${typst.version}
        '';
        syncVersionFiles = pkgs.writeShellApplication {
          name = "sync-version-files";
          runtimeInputs = [ node ];
          text = ''
            printf '%s' '${toolVersionsText}' > .tool-versions

            printf '%s\n' '${node.version}' > .node-version

            node --input-type=module <<'EOF'
            import fs from "node:fs";

            const packageJsonPath = "package.json";
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
            packageJson.packageManager = "pnpm@${pnpm.version}";
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "\t") + "\n");
            EOF
          '';
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            git
            node
            pnpm
            syncVersionFiles
            typst
          ];

          shellHook = ''
            sync-version-files

            export PATH="$PWD/node_modules/.bin:$PATH"
            export PLAYWRIGHT_BROWSERS_PATH='${playwrightBrowsers}'
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

            printf 'Updated .tool-versions and .node-version from flake defaults.\n'
          '';
        };
      }
    );
}
