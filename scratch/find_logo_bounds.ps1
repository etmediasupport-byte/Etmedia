Add-Type -AssemblyName System.Drawing

function Find-BoundingBoxes($path, $name) {
    if (-not (Test-Path $path)) { return }
    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    
    $minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0
    $blackMinX = $bmp.Width; $blackMaxX = 0; $blackMinY = $bmp.Height; $blackMaxY = 0
    $colorMinX = $bmp.Width; $colorMaxX = 0; $colorMinY = $bmp.Height; $colorMaxY = 0

    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            # Check if not pure white background (in logo2.jpeg) or not transparent
            $isBg = ($p.R -gt 240 -and $p.G -gt 240 -and $p.B -gt 240) -or ($p.A -lt 30)
            if (-not $isBg) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
                
                # Check for dark text pixels (R < 60, G < 60, B < 60)
                if ($p.R -lt 60 -and $p.G -lt 60 -and $p.B -lt 60) {
                    if ($x -lt $blackMinX) { $blackMinX = $x }
                    if ($x -gt $blackMaxX) { $blackMaxX = $x }
                    if ($y -lt $blackMinY) { $blackMinY = $y }
                    if ($y -gt $blackMaxY) { $blackMaxY = $y }
                }
                # Check for globe color pixels (Cyan/Purple/Blue)
                if ($p.B -gt 80 -or $p.G -gt 80) {
                    if ($x -lt $colorMinX) { $colorMinX = $x }
                    if ($x -gt $colorMaxX) { $colorMaxX = $x }
                    if ($y -lt $colorMinY) { $colorMinY = $y }
                    if ($y -gt $colorMaxY) { $colorMaxY = $y }
                }
            }
        }
    }
    
    Write-Host "=== $name Bounds ==="
    Write-Host "Content: X: $minX..$maxX, Y: $minY..$maxY"
    Write-Host "Dark/Black pixels: X: $blackMinX..$blackMaxX, Y: $blackMinY..$blackMaxY"
    Write-Host "Globe color pixels: X: $colorMinX..$colorMaxX, Y: $colorMinY..$colorMaxY"
    $bmp.Dispose()
}

Find-BoundingBoxes "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo2.jpeg" "logo2.jpeg"
Find-BoundingBoxes "C:\Users\PRASANNA\.gemini\antigravity-ide\brain\f4459a81-ae0d-4618-a6ea-8dc1816339b0\.user_uploaded\media_1790074863194.png" "media_1790074863194.png"
