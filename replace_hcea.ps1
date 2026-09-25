Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "HCEA") {
        $newContent = $content -replace "HCEA", "OHCEA"
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($_.FullName)"
    }
}
Write-Host "Done."
