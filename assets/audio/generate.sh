#!/bin/bash

BEEP_FILE="beep.mp3"
BEEP_DURATION=0.130  # seconds

for ms in $(seq 140 240); do
  total_duration=$(echo "60 / $ms" | bc -l)        # Convert ms to seconds
  silence_duration=$(echo "$total_duration - $BEEP_DURATION" | bc -l)

  # Ensure silence duration is non-negative
  if (( $(echo "$silence_duration > 0" | bc -l) )); then
    # Generate silence (MP3)
    ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t $silence_duration -q:a 9 silence.mp3 -y

    # Concatenate beep + silence (re-encoding for MP3)
    ffmpeg -i "$BEEP_FILE" -i silence.mp3 \
      -filter_complex "[0:0][1:0]concat=n=2:v=0:a=1[out]" \
      -map "[out]" -codec:a libmp3lame -q:a 2 "beep_${ms}ms.mp3" -y
  else
    echo "Skipping ${ms}ms — shorter than beep duration"
  fi
done
