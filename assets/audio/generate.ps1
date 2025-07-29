# Requires ffmpeg installed and added to PATH
$beepFile = "beep.wav"
$beepDuration = 0.130  # seconds

for ($ms = 40; $ms -le 240; $ms++) {
    $totalDuration = 60 / $ms
    $silenceDuration = $totalDuration - $beepDuration

    if ($silenceDuration -gt 0) {
        $silenceFile = "silence.wav"
        $outputFile = "clip_${ms}.wav"

        ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t $silenceDuration -c:a pcm_s16le -y $silenceFile
        ffmpeg -i $beepFile -i $silenceFile -filter_complex "[0:0][1:0]concat=n=2:v=0:a=1[out]" -map "[out]" -c:a pcm_s16le -y $outputFile


        Write-Host "Created $outputFile"
    }
    else {
        Write-Host "Skipping $ms ms - shorter than beep duration"
    }
}
