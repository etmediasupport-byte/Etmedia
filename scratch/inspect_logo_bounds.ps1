Add-Type -AssemblyName System.Drawing

function Inspect-Logo($path) {
    if (-not (Test-Path $path)) { return }
    $bmp = New-Object System.Drawing.Bitmap($path)
    Write-Host "=== $path ==="
    Write-Host "Dimensions: $($bmp.Width) x $($bmp.Height)"
    
    # Find bounding box of non-black/non-white or non-transparent pixels
    $minX = $bmp.Width
    $maxX = 0
    $minY = $bmp.Height
    $maxY = 0
    
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            # check if pixel is not transparent and not solid black background (e.g. A > 20 and (R>20 or G>20 or B>20))
            if ($p.A -gt 20 -and ($p.R -gt 25 -or $p.G -gt 25 -or $p.B -gt 25)) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    
    Write-Host "Content Bounding Box: X: $minX to $maxX, Y: $minY to $maxY"
    Write-Host "Content Dimensions: ($($maxX - $minX + 1)) x ($($maxY - $minY + 1))"
    $bmp.Dispose()
}

Inspect-Logo "frontend/src/assets/logo-final.png"
Inspect-Logo "frontend/src/assets/logo-official-transparent.png"
Inspect-Logo "frontend/src/assets/logo2-transparent.png"
