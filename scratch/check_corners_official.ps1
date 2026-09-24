Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap("frontend/src/assets/logo-official-transparent.png")
Write-Host "Corner pixels of logo-official-transparent.png:"
Write-Host "Top-Left (0,0): A=$($src.GetPixel(0,0).A) R=$($src.GetPixel(0,0).R) G=$($src.GetPixel(0,0).G) B=$($src.GetPixel(0,0).B)"
$src.Dispose()
