import { getColors } from '@/functions/common';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, EmitterSubscription, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

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

  const webViewRef = useRef<WebView>(null);
  const sendMessage = (msg: any) => {
    // if (webViewRef.current) {
    //   webViewRef.current.postMessage(JSON.stringify(msg));
    // }

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.handleRNMessage(${JSON.stringify(msg)});
        true;
      `);
    }
  };
  const metronomeHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metronome</title>
  </head>
  <body style="margin:0;padding:0;background:black;color:white;display:flex;align-items:center;justify-content:center;height:100vh;">
    <script>
      let audioCtx = null;
      let audioSource = null;
      let gainNode = null;
      let intervalId = null;
      let bpm = 120;
      let lastTickedOn = 0;

      function initAudio() {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          gainNode = audioCtx.createGain();
          gainNode.connect(audioCtx.destination);
          gainNode.gain.value = 0;
          

          // Create a simple click sound
          const sampleRate = audioContext.sampleRate;
          const duration = 0.05; // 50ms click
          const buffer = audioContext.createBuffer(
            1,
            sampleRate * duration,
            sampleRate
          );
          const data = buffer.getChannelData(0);

          // Create a click sound with a quick attack and decay
          for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            data[i] = Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-t * 50);
          }

          audioSource = audioCtx.createBufferSource();
          audioSource.buffer = buffer;
          audioSource.connect(audioContext.destination);

          window.ReactNativeWebView.postMessage('Audio initialized.', audioCtx, audioSource);
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
          window.ReactNativeWebView.postMessage('Audio resumed.');
        }
      }

      function playTick() {
        audioSource && audioSource.start();

        /*
        const osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
        osc.connect(gainNode);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
        */
        
      }

      function startMetronome() {
        initAudio(); // ensure audio context is ready after user gesture
        if (intervalId) return;
        const interval = 60000 / bpm;
        lastTickedOn = Date.now();
        playTick();
        intervalId = setInterval(() => {
          if (Date.now() - lastTickedOn >= interval) {
            playTick();
            lastTickedOn = Date.now();
          }
        }, interval / 20);
      }

      function stopMetronome() {
        clearInterval(intervalId);
        intervalId = null;
      }

      window.handleRNMessage = function(msg) {
        if (msg.command === 'start') startMetronome();
        else if (msg.command === 'stop') stopMetronome();
        else if (msg.command === 'setBpm') bpm = parseInt(msg.bpm);
        else if (msg.command === 'mute') gainNode && (gainNode.gain.value = 0);
        else if (msg.command === 'unmute') gainNode && (gainNode.gain.value = 1);
      }
    </script>
  </body>
</html>
`;


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
    sendMessage({ command: 'setBpm', bpm: bpm });
  }, [bpm]);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) {
      sendMessage({ command: 'mute' });
    } else {
      sendMessage({ command: 'unmute' });
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
      // console.log('Starting ambient track with BPM:', currentBpm);
      stopInterval();
      startTimeRef.current = Date.now();

      if (!mutedRef.current) {
        sendMessage({ command: 'unmute' });
      }
      sendMessage({ command: 'start' });

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
      sendMessage({ command: 'stop' });
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

      <WebView
        scrollEnabled={false}
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: metronomeHTML }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(event) => {
          console.log('WebView says:', event.nativeEvent.data);
        }}
        style={{width: 0, height: 0, opacity: 0, pointerEvents: 'none'}}
      />
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
