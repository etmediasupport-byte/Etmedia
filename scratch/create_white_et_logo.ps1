Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo-etmedia.png"
if (-not (Test-Path $srcPath)) {
    Write-Host "Source logo not found!"
    exit 1
}

$origBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $origBmp.Width
$height = $origBmp.Height

Write-Host "Processing $srcPath ($width x $height)..."

$outBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Globe bounding circle parameters in logo-etmedia.png (724 x 345):
# Globe center is approximately at X=142, Y=172, Radius=98
$globeCenterX = 142
$globeCenterY = 172
$globeRadius = 98

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $p = $origBmp.GetPixel($x, $y)
        
        $dx = $x - $globeCenterX
        $dy = $y - $globeCenterY
        $distFromGlobeCenter = [Math]::Sqrt($dx * $dx + $dy * $dy)
        
        # Determine if pixel is inside or on edge of globe
        $isInsideGlobe = $distFromGlobeCenter -le ($globeRadius + 4)
        
        if ($isInsideGlobe) {
            # Inside the globe:
            # Dark pixels (R < 70, G < 70, B < 70) belong to the "ET" text or dark globe lines inside the globe.
            # Convert dark "ET" pixels to WHITE!
            if ($p.R -lt 75 -and $p.G -lt 75 -and $p.B -lt 75) {
                # Turn black "ET" text inside the globe to WHITE
                # Keep smooth anti-aliasing based on darkness
                $brightness = ($p.R + $p.G + $p.B) / 3.0
                $alpha = [Math]::Max(0, [Math]::Min(255, [int](255 - ($brightness * 1.5))))
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
            } else {
                # Preserve globe color pixels (cyan/purple/blue gradient & lines)
                $outBmp.SetPixel($x, $y, $p)
            }
        } else {
            # Outside globe:
            # Check for MEDIA text or background
            # If pixel is bright (R > 120 or G > 120 or B > 120), it is part of MEDIA text -> Make it pure WHITE
            if ($p.R -gt 100 -and $p.G -gt 100 -and $p.B -gt 100) {
                $avg = ($p.R + $p.G + $p.B) / 3.0
                $alpha = [Math]::Min(255, [int]($avg * 1.2))
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
            } elseif ($p.R -gt 50 -and $p.G -gt 50 -and $p.B -gt 50) {
                # Edge/anti-aliased text pixel
                $avg = ($p.R + $p.G + $p.B) / 3.0
                $alpha = [Math]::Min(255, [int]($avg * 1.5))
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
            } else {
                # Background black -> TRANSPARENT
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
}

$origBmp.Dispose()

# Save to assets and public folders
$target1 = "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo2-transparent.png"
$target2 = "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\public\logo2-transparent.png"

$outBmp.Save($target1, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Save($target2, [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Successfully saved processed logo with WHITE 'ET' text in globe and WHITE 'MEDIA' text to:"
Write-Host "  1. $target1"
Write-Host "  2. $target2"
$outBmp.Dispose()
