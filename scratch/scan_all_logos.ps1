Add-Type -AssemblyName System.Drawing

function Scan-Detailed($path, $name) {
    if (-not (Test-Path $path)) { return }
    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    Write-Host "=== $name (W:$($bmp.Width), H:$($bmp.Height)) ==="
    
    for ($y = 0; $y -lt $bmp.Height; $y += [Math]::Max(1, [Math]::Floor($bmp.Height / 15))) {
        $line = ""
        for ($x = 0; $x -lt $bmp.Width; $x += [Math]::Max(1, [Math]::Floor($bmp.Width / 60))) {
            $p = $bmp.GetPixel($x, $y)
            # R,G,B values
            if ($p.R -lt 40 -and $p.G -lt 40 -and $p.B -lt 40) {
                $line += "B" # Black
            } elseif ($p.R -gt 210 -and $p.G -gt 210 -and $p.B -gt 210) {
                $line += "W" # White
            } elseif ($p.G -gt 60 -or $p.B -gt 60) {
                $line += "C" # Cyan/Blue
            } elseif ($p.R -gt 80 -and $p.B -gt 80) {
                $line += "P" # Purple
            } else {
                $line += "?"
            }
        }
        Write-Host ("Y={0:D3}: {1}" -f $y, $line)
    }
    $bmp.Dispose()
}

Scan-Detailed "C:\Users\PRASANNA\.gemini\antigravity-ide\brain\f4459a81-ae0d-4618-a6ea-8dc1816339b0\.user_uploaded\media_1790074863194.png" "uploaded_media"
Scan-Detailed "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo-etmedia.png" "logo-etmedia.png"
Scan-Detailed "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo2.jpeg" "logo2.jpeg"
