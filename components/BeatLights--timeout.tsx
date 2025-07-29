import { getColors } from '@/functions/common';
import { AudioPlayer, useAudioPlayer } from 'expo-audio';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const audioSource = require('../assets/audio/beep.mp3');
export function initAudio(onError:Function) {
  try {
    return useAudioPlayer(audioSource);
  } catch (error) {
    console.error('Error initializing audio:', error);
    onError();
  }
  return null;
}

export function playClick(player: null|AudioPlayer, isMuted:boolean = true) {
  if (!player || isMuted) return;
  try {
    player.seekTo(0);
    player.play();
  } catch (error) {
    console.error('Error playing click:', error);
  }
}

const BeatCircle = ({ isActive, isStart }: {isActive: boolean, isStart: boolean}) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const themeColors = getColors();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isActive ? 1 : 0.3,
      duration: isActive ? 50 : 200,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  const backgroundColor = isStart
    ? themeColors.beat.first
    : isActive
    ? themeColors.beat.active
    : themeColors.beat.inactive;

  return (
    <Animated.View
      style={[
        styles.beatLight,
        {
          backgroundColor,
          opacity: fadeAnim,
        },
      ]}
    />
  );
};

export default function BeatLights({ playing = false, muted = true, bpm = 120, onError = () => {} }: { playing?: boolean, muted?: boolean, bpm?:number, onError?:Function }) {
  
  const player = initAudio(onError);
  // useEffect(() => {
  //   initAudio(() => {
  //     onError();
  //   });
  // }, []);

  const beatCount = 4;
  const [isRunning, setIsRunning] = useState(playing);
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const mutedRef = useRef(muted);
  const intervalRef = useRef<number | null>(null);
  const intervalTime = 60000 / currentBpm;

  useEffect(() => {
    const doMetronome = async () => {
      if (playing) {
        await startMetronome();
      } else {
        stopMetronome();
      }
    };
    doMetronome();
  }, [playing]);
  
  useEffect(() => setCurrentBpm(bpm), [bpm]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);


  const scheduleNextClick = async (beat: number = 0) => {
    const now = Date.now();    

    setCurrentBeat(beat);
    await playClick(player, mutedRef.current);

    const nextTick = intervalTime - (Date.now() - now);
    intervalRef.current = setTimeout(() => {
      scheduleNextClick((beat + 1) % 4);
    }, nextTick);
  };
  
  const startMetronome = async () => {
    if (isRunning) return;
    await scheduleNextClick(0);
    setIsRunning(true);
  };

  const stopMetronome = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    setCurrentBeat(-1);
  };

  return (
    <View style={[styles.circleWrapper]}>
      {[0, 1, 2, 3].map((i) => {
        const isActive = currentBeat === i;
        const isStart = i === 0 && isActive;
          return (
            <BeatCircle
              key={i}
              isActive={currentBeat === i}
              isStart={i === 0 && currentBeat === i}
            />
          )
        }
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circleWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    flexWrap: 'wrap',
  },
  beatLight: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: '#90ee90',
  },
});