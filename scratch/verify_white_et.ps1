Add-Type -AssemblyName System.Drawing

$path = "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo2-transparent.png"
$bmp = [System.Drawing.Bitmap]::FromFile($path)

Write-Host "Verifying $path ($($bmp.Width) x $($bmp.Height))..."

# Check ET text inside globe (center around X=142, Y=172)
$whiteInGlobe = 0
$colorInGlobe = 0
$transInGlobe = 0

for ($y = 120; $y -lt 220; $y++) {
    for ($x = 90; $x -lt 190; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.A -gt 150 -and $p.R -gt 220 -and $p.G -gt 220 -and $p.B -gt 220) {
            $whiteInGlobe++
        } elseif ($p.A -gt 150) {
            $colorInGlobe++
        } else {
            $transInGlobe++
        }
    }
}

Write-Host "ET Region Inside Globe - White pixels: $whiteInGlobe, Globe color pixels: $colorInGlobe, Transparent: $transInGlobe"

# Check MEDIA text on right (X=250..700, Y=100..250)
$whiteInMedia = 0
$transInMedia = 0
for ($y = 100; $y -lt 250; $y++) {
    for ($x = 250; $x -lt 700; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.A -gt 150 -and $p.R -gt 220 -and $p.G -gt 220 -and $p.B -gt 220) {
            $whiteInMedia++
        } else {
            $transInMedia++
        }
    }
}
Write-Host "MEDIA Region - White text pixels: $whiteInMedia, Transparent background: $transInMedia"

$bmp.Dispose()
