Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap("frontend/src/assets/logo-final.png")
Write-Host "Corner pixels of logo-final.png:"
Write-Host "Top-Left (0,0): A=$($src.GetPixel(0,0).A) R=$($src.GetPixel(0,0).R) G=$($src.GetPixel(0,0).G) B=$($src.GetPixel(0,0).B)"
Write-Host "Top-Right ($($src.Width-1),0): R=$($src.GetPixel($src.Width-1,0).R)"
Write-Host "Bottom-Left (0,$($src.Height-1)): R=$($src.GetPixel(0,$src.Height-1).R)"
$src.Dispose()
