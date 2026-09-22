Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo-etmedia.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

Write-Host "Logo-ETMedia dimensions: $($bmp.Width) x $($bmp.Height)"

# Let's inspect the globe area (left side) and media text area (right side)
# In logo-etmedia.png, background is black.
# Globe is approximately X: 40..250, Y: 50..300.
# MEDIA text is approximately X: 270..700, Y: 100..260.

# Inside the globe (X: 40..250, Y: 50..300), what pixels are dark/black?
$etBlackCount = 0
$etWhiteCount = 0
$globeColorCount = 0

for ($y = 50; $y -lt 300; $y++) {
    for ($x = 40; $x -lt 250; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 40 -and $p.G -lt 40 -and $p.B -lt 40) {
            $etBlackCount++
        } elseif ($p.R -gt 200 -and $p.G -gt 200 -and $p.B -gt 200) {
            $etWhiteCount++
        } elseif ($p.G -gt 50 -or $p.B -gt 50 -or $p.R -gt 50) {
            $globeColorCount++
        }
    }
}

Write-Host "Globe region - Black: $etBlackCount, White: $etWhiteCount, Globe Colors: $globeColorCount"

# Now let's inspect MEDIA text region (X: 250..720, Y: 50..300)
$mediaWhiteCount = 0
$mediaBlackCount = 0
for ($y = 50; $y -lt 300; $y++) {
    for ($x = 250; $x -lt 720; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -gt 200 -and $p.G -gt 200 -and $p.B -gt 200) {
            $mediaWhiteCount++
        } elseif ($p.R -lt 40 -and $p.G -lt 40 -and $p.B -lt 40) {
            $mediaBlackCount++
        }
    }
}

Write-Host "MEDIA region - White: $mediaWhiteCount, Black: $mediaBlackCount"
$bmp.Dispose()
