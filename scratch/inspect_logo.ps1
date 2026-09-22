Add-Type -AssemblyName System.Drawing

$uploadedPath = "C:\Users\PRASANNA\.gemini\antigravity-ide\brain\f4459a81-ae0d-4618-a6ea-8dc1816339b0\.user_uploaded\media_1790074863194.png"
$logo2Path = "c:\Users\PRASANNA\Freelancing\et-media-hub\frontend\public\logo2-transparent.png"

if (Test-Path $uploadedPath) {
    $img1 = [System.Drawing.Bitmap]::FromFile($uploadedPath)
    Write-Host "Uploaded image: $($img1.Width) x $($img1.Height)"
    $img1.Dispose()
}

if (Test-Path $logo2Path) {
    $img2 = [System.Drawing.Bitmap]::FromFile($logo2Path)
    Write-Host "logo2-transparent: $($img2.Width) x $($img2.Height)"
    $img2.Dispose()
}
