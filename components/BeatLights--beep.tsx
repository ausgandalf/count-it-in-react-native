import { AndroidSoundIDs, iOSSoundIDs } from '@/constants/Beeps';
import { getColors } from '@/functions/common';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, NativeModules, Platform, StyleSheet, View } from 'react-native';

const  RNReactNativeABeep  = NativeModules.RNReactNativeABeep;
const beepSoundID = Platform.OS == "android" ? AndroidSoundIDs.TONE_CDMA_ALERT_AUTOREDIAL_LITE : iOSSoundIDs.SMSReceived_Vibrate;

export function playClick(isMuted:boolean = true) {
  if (isMuted) return;
  
  if (Platform.OS == "android") RNReactNativeABeep.StopSysSound();
  RNReactNativeABeep.PlaySysSound(beepSoundID);
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
  
  // const player = initAudio(onError);
  
  const beatCount = 4;
  const [isRunning, setIsRunning] = useState(playing);
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const mutedRef = useRef(muted);
  const intervalRef = useRef<number | null>(null);
  const intervalTime = 60000 / currentBpm;

  useEffect(() => {
    if (playing) {
      startMetronome();
    } else {
      stopMetronome();
    }
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


  const scheduleNextClick = (beat: number = 0) => {
    const beatIndex = beat % beatCount;
    setCurrentBeat(beatIndex);
    playClick(mutedRef.current);
    intervalRef.current = setTimeout(() => {
      scheduleNextClick(beatIndex + 1);
    }, intervalTime);
  };
  
  const startMetronome = () => {
    if (isRunning) return;
    scheduleNextClick(0);
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