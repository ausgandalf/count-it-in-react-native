import { getColors } from '@/functions/common';
import { useAudioPlayer } from 'expo-audio';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import TrackPlayer, { Capability } from 'react-native-track-player';

let BEEP_TRACK = {
  id: 'countitin-beep',
  url: require('../assets/audio/beep.mp3'),
  title: 'CountItIn - Metronome Tick',
  artist: 'CountItIn',
  index: 0,
};


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

export async function playClick(isMuted:boolean = true) {
  if (isMuted) return;
  await TrackPlayer.seekTo(0);
  await TrackPlayer.play();
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
    // Initialize TrackPlayer once
    TrackPlayer.setupPlayer().then(() => {
      TrackPlayer.updateOptions({
        stoppingAppPausesPlayback: true,
        capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      });
      TrackPlayer.add([BEEP_TRACK]).then((index) => {
        BEEP_TRACK.index = (index as number);
      });
    });
  }, []);

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
    const beatIndex = beat % beatCount;
    setCurrentBeat(beatIndex);
    await playClick(mutedRef.current);
    const nextTick = intervalTime - (Date.now() - now);
    intervalRef.current = setTimeout(() => {
      scheduleNextClick(beatIndex + 1);
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