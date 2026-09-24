Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem "frontend/src/assets/logo*"
foreach ($f in $files) {
    if ($f.Extension -eq ".svg") { continue }
    try {
        $bmp = New-Object System.Drawing.Bitmap($f.FullName)
        $hasTransparentPixels = $false
        $nonTransparentAlpha255 = 0
        $transparentAlpha0 = 0
        
        for ($x = 0; $x -lt $bmp.Width; $x += [Math]::Max(1, [int]($bmp.Width / 20))) {
            for ($y = 0; $y -lt $bmp.Height; $y += [Math]::Max(1, [int]($bmp.Height / 20))) {
                $pixel = $bmp.GetPixel($x, $y)
                if ($pixel.A -lt 255) {
                    $hasTransparentPixels = $true
                    $transparentAlpha0++
                } else {
                    $nonTransparentAlpha255++
                }
            }
        }
        
        Write-Host "$($f.Name) | W:$($bmp.Width) H:$($bmp.Height) | HasTransparentPixels: $hasTransparentPixels (Alpha<255 count: $transparentAlpha0, Alpha=255 count: $nonTransparentAlpha255)"
        $bmp.Dispose()
    } catch {
        Write-Host "$($f.Name) | Error: $_"
    }
}
