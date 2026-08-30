[CmdletBinding()]
param(
    [ValidateSet("Sync", "Check")]
    [string]$Mode = "Check"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$sourceRoot = Join-Path $repoRoot ".agents\skills"
$targetRoot = Join-Path $repoRoot ".claude\skills"
$manifestPath = Join-Path $sourceRoot "managed-skills.txt"

function Fail {
    param([string]$Message)
    throw "agent-skills: $Message"
}

function Get-ManagedSkills {
    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
        Fail "missing manifest: $manifestPath"
    }

    $entries = @()
    $seen = @{}
    foreach ($line in Get-Content -LiteralPath $manifestPath) {
        $name = $line.Trim()
        if (-not $name -or $name.StartsWith("#")) {
            continue
        }
        if ($name -notmatch "^[a-z0-9]+(?:-[a-z0-9]+)*$") {
            Fail "invalid skill name in manifest: $name"
        }
        if ($name -eq "synced") {
            Fail "the reserved Claude skill name 'synced' cannot be managed"
        }
        if ($seen.ContainsKey($name)) {
            Fail "duplicate skill in manifest: $name"
        }
        $seen[$name] = $true
        $entries += $name
    }

    if ($entries.Count -eq 0) {
        Fail "manifest contains no managed skills"
    }
    return $entries
}

function Assert-SkillFrontmatter {
    param(
        [string]$SkillName,
        [string]$SkillRoot
    )

    $skillFile = Join-Path (Join-Path $SkillRoot $SkillName) "SKILL.md"
    if (-not (Test-Path -LiteralPath $skillFile -PathType Leaf)) {
        Fail "missing SKILL.md: $skillFile"
    }

    $content = [System.IO.File]::ReadAllText($skillFile)
    $frontmatterMatch = [regex]::Match(
        $content,
        "\A---\r?\n(?<front>.*?)\r?\n---(?:\r?\n|\z)",
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )
    if (-not $frontmatterMatch.Success) {
        Fail "invalid YAML frontmatter delimiters: $skillFile"
    }

    $frontmatter = $frontmatterMatch.Groups["front"].Value
    $nameMatch = [regex]::Match($frontmatter, "(?m)^name:\s*(?<value>[a-z0-9-]+)\s*$")
    $descriptionMatch = [regex]::Match($frontmatter, "(?m)^description:\s*(?<value>.+?)\s*$")
    $allowedKeys = @(
        "name",
        "description",
        "license",
        "compatibility",
        "metadata",
        "allowed-tools"
    )
    $topLevelKeys = [regex]::Matches(
        $frontmatter,
        "(?m)^(?<key>[A-Za-z0-9_-]+):"
    )
    foreach ($keyMatch in $topLevelKeys) {
        $key = $keyMatch.Groups["key"].Value
        if ($key -notin $allowedKeys) {
            Fail "unexpected frontmatter key '$key': $skillFile"
        }
    }

    if (-not $nameMatch.Success) {
        Fail "frontmatter name is missing or invalid: $skillFile"
    }
    $declaredName = $nameMatch.Groups["value"].Value
    if ($declaredName -ne $SkillName) {
        Fail "frontmatter name does not match directory '$SkillName': $skillFile"
    }
    if ($declaredName.Length -gt 64) {
        Fail "frontmatter name exceeds 64 characters: $skillFile"
    }
    if (-not $descriptionMatch.Success -or
        [string]::IsNullOrWhiteSpace($descriptionMatch.Groups["value"].Value)) {
        Fail "frontmatter description is missing: $skillFile"
    }
    $description = $descriptionMatch.Groups["value"].Value.Trim()
    if ($description.Length -gt 1024) {
        Fail "frontmatter description exceeds 1024 characters: $skillFile"
    }
    if ($description.Contains("<") -or $description.Contains(">")) {
        Fail "frontmatter description contains an angle bracket: $skillFile"
    }
    if ($description.StartsWith("[TODO:")) {
        Fail "frontmatter description contains an unfinished TODO: $skillFile"
    }
}

function Get-RelativeFiles {
    param([string]$Root)

    $rootPath = [System.IO.Path]::GetFullPath($Root)
    $prefix = $rootPath.TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    ) + [System.IO.Path]::DirectorySeparatorChar

    return @(
        Get-ChildItem -LiteralPath $rootPath -Recurse -File |
            ForEach-Object {
                $_.FullName.Substring($prefix.Length).Replace(
                    [System.IO.Path]::DirectorySeparatorChar,
                    [char]"/"
                )
            } |
            Sort-Object
    )
}

function Assert-SkillCopy {
    param([string]$SkillName)

    $source = Join-Path $sourceRoot $SkillName
    $target = Join-Path $targetRoot $SkillName
    if (-not (Test-Path -LiteralPath $target -PathType Container)) {
        Fail "missing Claude copy: $target"
    }

    $sourceFiles = @(Get-RelativeFiles -Root $source)
    $targetFiles = @(Get-RelativeFiles -Root $target)
    $fileDiff = Compare-Object -ReferenceObject $sourceFiles -DifferenceObject $targetFiles
    if ($fileDiff) {
        Fail ("file list drift for {0}: {1}" -f $SkillName, (
            $fileDiff | Out-String
        ))
    }

    foreach ($relativePath in $sourceFiles) {
        $platformPath = $relativePath.Replace(
            [char]"/",
            [System.IO.Path]::DirectorySeparatorChar
        )
        $sourceHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (
            Join-Path $source $platformPath
        )).Hash
        $targetHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (
            Join-Path $target $platformPath
        )).Hash
        if ($sourceHash -ne $targetHash) {
            Fail "content drift for $SkillName/$relativePath"
        }
    }
}

$skills = @(Get-ManagedSkills)
foreach ($skill in $skills) {
    Assert-SkillFrontmatter -SkillName $skill -SkillRoot $sourceRoot
}

if ($Mode -eq "Sync") {
    if (-not (Test-Path -LiteralPath $targetRoot -PathType Container)) {
        New-Item -ItemType Directory -Path $targetRoot -Force | Out-Null
    }

    $targetRootFull = [System.IO.Path]::GetFullPath($targetRoot).TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    ) + [System.IO.Path]::DirectorySeparatorChar

    foreach ($skill in $skills) {
        $source = Join-Path $sourceRoot $skill
        $target = [System.IO.Path]::GetFullPath((Join-Path $targetRoot $skill))
        if (-not $target.StartsWith(
            $targetRootFull,
            [System.StringComparison]::OrdinalIgnoreCase
        )) {
            Fail "refusing target outside .claude/skills: $target"
        }
        if (Test-Path -LiteralPath $target) {
            Remove-Item -LiteralPath $target -Recurse -Force
        }
        Copy-Item -LiteralPath $source -Destination $target -Recurse -Force
    }
    Write-Host "SYNCED: $($skills.Count) managed skill(s) to .claude/skills."
}

foreach ($skill in $skills) {
    Assert-SkillCopy -SkillName $skill
}

Write-Host "PASS: $($skills.Count) managed skill(s) have valid frontmatter and no drift."
