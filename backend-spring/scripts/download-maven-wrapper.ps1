<#
Downloads the maven-wrapper.jar into .mvn\wrapper\maven-wrapper.jar
Run from repo root or from backend-spring directory.
#>
param(
    [string]$Version = '0.5.6'
)

$uri = "https://repo1.maven.org/maven2/io/takari/maven-wrapper/$Version/maven-wrapper-$Version.jar"
$outDir = Join-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath '..\backend-spring') -ChildPath '.mvn\wrapper'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$outFile = Join-Path -Path $outDir -ChildPath 'maven-wrapper.jar'
Write-Host "Downloading $uri to $outFile"
Invoke-WebRequest -Uri $uri -OutFile $outFile -UseBasicParsing
Write-Host "Done. You can now run .\mvnw or ./mvnw"
