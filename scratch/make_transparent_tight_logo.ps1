Add-Type -AssemblyName System.Drawing

function Convert-ToTightTransparent($inputPath, $outputPath) {
    Write-Host "Processing: $inputPath -> $outputPath"
    $orig = New-Object System.Drawing.Bitmap($inputPath)
    $w = $orig.Width
    $h = $orig.Height

    # Create 32bppArgb bitmap
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($orig, 0, 0, $w, $h)
    $g.Dispose()
    $orig.Dispose()

    # Step 1: Make black background transparent if applicable
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $bmp.GetPixel($x, $y)
            # If pixel is dark background (R<25, G<25, B<25)
            if ($p.R -lt 25 -and $p.G -lt 25 -and $p.B -lt 25) {
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } else {
                # Smooth antialiasing for semi-dark edge pixels
                $maxComponent = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
                if ($maxComponent -lt 60) {
                    $alpha = [int](($maxComponent / 60.0) * $p.A)
                    $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
                }
            }
        }
    }

    # Step 2: Find tight bounding box of visible content (Alpha > 10)
    $minX = $w
    $maxX = 0
    $minY = $h
    $maxY = 0

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.A -gt 15) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    if ($minX -ge $maxX -or $minY -ge $maxY) {
        Write-Host "Warning: No visible content found!"
        $bmp.Dispose()
        return
    }

    # Add 4px padding
    $minX = [Math]::Max(0, $minX - 4)
    $minY = [Math]::Max(0, $minY - 4)
    $maxX = [Math]::Min($w - 1, $maxX + 4)
    $maxY = [Math]::Min($h - 1, $maxY + 4)

    $cropWidth = $maxX - $minX + 1
    $cropHeight = $maxY - $minY + 1

    Write-Host "Cropping from ${w}x${h} to ${cropWidth}x${cropHeight} (Bounds: X=$minX..$maxX, Y=$minY..$maxY)"

    $cropBmp = New-Object System.Drawing.Bitmap($cropWidth, $cropHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $cg = [System.Drawing.Graphics]::FromImage($cropBmp)
    $cg.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $cg.DrawImage($bmp, 0, 0, (New-Object System.Drawing.Rectangle($minX, $minY, $cropWidth, $cropHeight)), [System.Drawing.GraphicsUnit]::Pixel)
    $cg.Dispose()
    $bmp.Dispose()

    $cropBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropBmp.Dispose()
    Write-Host "Saved transparent tight logo to $outputPath"
}

Convert-ToTightTransparent "frontend/src/assets/logo-final.png" "frontend/src/assets/logo-final.png"
Convert-ToTightTransparent "frontend/src/assets/logo-official-transparent.png" "frontend/src/assets/logo-official-transparent.png"
Copy-Item "frontend/src/assets/logo-final.png" "frontend/src/assets/logo2-transparent.png" -Force
Copy-Item "frontend/src/assets/logo-final.png" "frontend/src/assets/logo-etmedia.png" -Force

# Copy to public folder if it exists
if (Test-Path "frontend/public") {
    Copy-Item "frontend/src/assets/logo-final.png" "frontend/public/logo-final.png" -Force
    Copy-Item "frontend/src/assets/logo-final.png" "frontend/public/logo2-transparent.png" -Force
    Copy-Item "frontend/src/assets/logo-final.png" "frontend/public/logo-etmedia.png" -Force
}
