# Files

This monorepo groups Files.Api and Files.UI.

- Files.Api is imported into src/Files.Api (copied from the original repository).
- Files.UI is currently a placeholder at src/Files.UI. Use scripts/import-files-ui.ps1 to import the UI repo into the monorepo, optionally preserving history:

PowerShell example:
  .\scripts\import-files-ui.ps1 -RepoUrl https://github.com/owner/Files.UI.git -Branch main -PreserveHistory

GitHub Actions:
- .github/workflows/publish-nuget.yml will build and publish Files.Api when changes are pushed under src/Files.Api/**
- .github/workflows/publish-npm.yml will publish Files.UI when changes are pushed under src/Files.UI/**

After importing Files.UI and verifying everything, create a remote GitHub repository for this monorepo and push.

