Add-Type -AssemblyName System.Drawing

function Analyze-Image($path, $label) {
    if (-not (Test-Path $path)) { Write-Host "$label file not found: $path"; return }
    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    Write-Host "=== $label ==="
    Write-Host "Width: $($bmp.Width), Height: $($bmp.Height)"
    
    # Sample center, left, right colors
    $blackPixels = 0
    $whitePixels = 0
    $blueCyanPixels = 0
    $transparentPixels = 0
    
    for ($y = 0; $y -lt $bmp.Height; $y += [Math]::Max(1, [Math]::Floor($bmp.Height / 20))) {
        for ($x = 0; $x -lt $bmp.Width; $x += [Math]::Max(1, [Math]::Floor($bmp.Width / 40))) {
            $pixel = $bmp.GetPixel($x, $y)
            if ($pixel.A -lt 50) {
                $transparentPixels++
            } elseif ($pixel.R -lt 50 -and $pixel.G -lt 50 -and $pixel.B -lt 50) {
                $blackPixels++
            } elseif ($pixel.R -gt 200 -and $pixel.G -gt 200 -and $pixel.B -gt 200) {
                $whitePixels++
            } elseif ($pixel.B -gt 100 -or $pixel.G -gt 100) {
                $blueCyanPixels++
            }
        }
    }
    Write-Host "Pixels sample - Trans: $transparentPixels, Black: $blackPixels, White: $whitePixels, Color: $blueCyanPixels"
    $bmp.Dispose()
}

Analyze-Image "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo2.jpeg" "logo2.jpeg"
Analyze-Image "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo2-transparent.png" "logo2-transparent.png"
Analyze-Image "C:\Users\PRASANNA\.gemini\antigravity-ide\brain\f4459a81-ae0d-4618-a6ea-8dc1816339b0\.user_uploaded\media_1790074863194.png" "media_1790074863194.png"
