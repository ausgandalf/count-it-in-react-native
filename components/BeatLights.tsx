import { CLIPS } from '@/constants/Clips';
import { getColors } from '@/functions/common';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, EmitterSubscription, LogBox, StyleSheet, View } from 'react-native';
import { AudioPro, AudioProContentType } from 'react-native-audio-pro';

// Suppress NativeEventEmitter warnings from react-native-audio-pro
LogBox.ignoreLogs([
  'new NativeEventEmitter() was called with a non-null argument without the required `addListener` method.',
  'new NativeEventEmitter() was called with a non-null argument without the required `removeListeners` method.',
]);

// Optional: Set playback config
AudioPro.configure({
  contentType: AudioProContentType.MUSIC,
  // debug: __DEV__,
});

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
  
  const beatCount = 4;
  const [isRunning, setIsRunning] = useState(playing);
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const mutedRef = useRef(muted);
  const subscriptionRef = useRef<EmitterSubscription | null>(null);
  const intervalRef = useRef<number | null>(null);
  const intervalTime = 60000 / currentBpm;
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const doMetronome = async () => {
      if (playing) {
        startMetronome();
      } else {
        stopMetronome();
      }
    };
    doMetronome();
  }, [playing]);
  
  useEffect(() => setCurrentBpm(bpm), [bpm]);
  useEffect(() => {
    mutedRef.current = muted;
    if (muted) {
      AudioPro.ambientSetVolume(0);
    } else {
      AudioPro.ambientSetVolume(1);
    }
  }, [muted]);
  
  const doNextBeat = () => {
    setCurrentBeat((prevBeat) => (prevBeat + 1) % beatCount);
  }

  const scheduleNextBeat = () => {
    doNextBeat();
    // Schedule the next beat
    intervalRef.current = setInterval(() => {
      if (Date.now() - startTimeRef.current >= intervalTime) {
        startTimeRef.current = startTimeRef.current + intervalTime;
        doNextBeat();
      }
    }, intervalTime / 11);
  }

  const stopInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    startTimeRef.current = 0;
  }

  const startMetronome = () => {
    if (isRunning) return;
    
    try {
      // console.log('Starting ambient track with BPM:', currentBpm);
      stopInterval();

      startTimeRef.current = Date.now();

      AudioPro.ambientPlay({
        url: CLIPS[currentBpm],
        loop: true,
      });

      // Start the recursive timer
      scheduleNextBeat();

      setIsRunning(true);
    } catch (error) {
      console.error('Error starting metronome:', error);
      onError();
    }
  };

  const stopMetronome = () => {
    try {
      AudioPro.ambientStop();
      stopInterval();
      setIsRunning(false);
      setCurrentBeat(-1);
    } catch (error) {
      console.error('Error stopping metronome:', error);
    }
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