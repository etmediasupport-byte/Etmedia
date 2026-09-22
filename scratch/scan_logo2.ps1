Add-Type -AssemblyName System.Drawing

$bmp = [System.Drawing.Bitmap]::FromFile("c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo2.jpeg")
Write-Host "Width: $($bmp.Width), Height: $($bmp.Height)"

# Find non-white pixels in logo2.jpeg
for ($y = 100; $y -lt 700; $y += 30) {
    $lineStr = ""
    for ($x = 100; $x -lt 1500; $x += 30) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 50 -and $p.G -lt 50 -and $p.B -lt 50) {
            $lineStr += "K" # Black
        } elseif ($p.R -gt 230 -and $p.G -gt 230 -and $p.B -gt 230) {
            $lineStr += "." # White background
        } else {
            $lineStr += "C" # Color (Globe)
        }
    }
    if ($lineStr -match "[KC]") {
        Write-Host ("Y={0:D3}: {1}" -f $y, $lineStr)
    }
}
$bmp.Dispose()
