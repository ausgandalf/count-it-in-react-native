import { getColors } from '@/functions/common';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import BeepPlayer from 'react-native-beep-player';

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
  
  useEffect(() => {
    setCurrentBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) {
      BeepPlayer.mute(true);
    } else {
      BeepPlayer.mute(false);
    }
  }, [muted]);
  
  const doNextBeat = () => {
    setCurrentBeat((prevBeat) => (prevBeat + 1) % beatCount);
  }

  const scheduleNextBeat = () => {
    
    // Schedule the next beat
    intervalRef.current = setTimeout(() => {
      if (Date.now() - startTimeRef.current >= intervalTime) {
        startTimeRef.current = startTimeRef.current + intervalTime;
        doNextBeat();
      }
      scheduleNextBeat();
    }, intervalTime / 20);
  }

  const stopInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    startTimeRef.current = 0;
  }

  const startMetronome = () => {
    if (isRunning) return;
    
    try {

      if (mutedRef.current) {
        BeepPlayer.mute(true);
      } else {
        BeepPlayer.mute(false);
      }

      BeepPlayer.start(currentBpm, 'beep.wav');
      
      // Start the recursive timer
      startTimeRef.current = Date.now();
      doNextBeat();
      scheduleNextBeat(); 
      setIsRunning(true);
    } catch (error) {
      console.error('Error starting metronome:', error);
      onError();
    }
  };

  const stopMetronome = () => {
    try {
      BeepPlayer.stop();
      stopInterval();
      setIsRunning(false);
      setCurrentBeat(-1);
    } catch (error) {
      console.error('Error stopping metronome:', error);
    }
  };

  return (
    <View>
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  circleWrapper: {
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
