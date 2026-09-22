Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo2-transparent.png"
if (-not (Test-Path $srcPath)) {
    Write-Host "Processed logo not found!"
    exit 1
}

$targets = @(
    "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo2-transparent.png",
    "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\public\logo2-transparent.png",
    "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\src\assets\logo-etmedia.png",
    "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\public\logo-etmedia.png"
)

foreach ($t in $targets) {
    Copy-Item -Path $srcPath -Destination $t -Force
    Write-Host "Updated: $t"
}
