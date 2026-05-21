param(
  [Parameter(Mandatory=$true)]
  [string]$RepoUrl,
  [string]$Branch = "main",
  [switch]$PreserveHistory
)

Write-Host "Importing $RepoUrl into src/Files.UI (branch: $Branch)"

git remote add files-ui-temp $RepoUrl
git fetch files-ui-temp

if ($PreserveHistory) {
  Write-Host "Adding subtree with preserved history..."
  git subtree add --prefix=src/Files.UI files-ui-temp $Branch
} else {
  Write-Host "Adding subtree and squashing history..."
  git subtree add --prefix=src/Files.UI files-ui-temp $Branch --squash
}
