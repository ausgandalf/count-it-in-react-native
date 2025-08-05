import { getCommonStyles } from '@/constants/Styles';
import { Slider } from '@miblanchard/react-native-slider';
import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import BeatLights from './BeatLights';
import { ThemedText } from './ThemedText';

export default function BpmControls({ bpm, playing = false, muted = true, onUpdate }: {
  bpm: number;
  playing?: boolean;
  muted?: boolean;
  onUpdate: (type:string, value:boolean|number) => void;
}) {

  const { width: windowWidth } = useWindowDimensions();

  const [bpmValue, setBpmValue] = useState(bpm);
  useEffect(() => setBpmValue(bpm), [bpm]);

  const [isPlaying, setPlaying] = useState(playing);
  const [isMuted, setMuted] = useState(muted);

  const onStateUpdated = (type:string, value:boolean|number) => {
    // Sending signal to parent component
    onUpdate(type, value);
  };

  const commonStyles = getCommonStyles();
  const styles = StyleSheet.create({
    container: {
      gap: 20,
    },
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') {
        setPlaying(false);
        onStateUpdated('playing', false);
      }
    });
  
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{gap: 0}}>
        <ThemedText type="default" textAlign="center">BPM: {bpmValue}</ThemedText>
        <Slider
          minimumValue={40}
          maximumValue={240}
          step={1}
          value={bpmValue}
          onValueChange={(value: number[]) => {
            const v = value[0]; // The new slider returns an array
            setBpmValue(v);
            onStateUpdated('setBpm', v);
          }}
        />
      </View>
      <View style={commonStyles.buttonGroup}>
        <TouchableOpacity style={[commonStyles.button, isPlaying ? commonStyles.dangerButton : commonStyles.primaryButton]} onPress={() => {
          setPlaying(!isPlaying);
          onStateUpdated('playing', !isPlaying);
        }}>
          <Text style={commonStyles.buttonText}>{isPlaying ? '⏹ Stop' : '▶ Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[commonStyles.button, isMuted ? commonStyles.disabledButton : commonStyles.primaryButton]} onPress={() => {
          setMuted(!isMuted);
          onStateUpdated('muted', !isMuted);
        }}>
          <Text style={commonStyles.buttonText}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[commonStyles.button, commonStyles.secondaryButton]} onPress={() => {
          onStateUpdated('saveBpm', bpmValue);
        }}>
          <Text style={commonStyles.buttonText}>Save BPM</Text>
        </TouchableOpacity>
      </View>
      <View style={{height: 130}}>
        <BeatLights bpm={bpmValue} playing={isPlaying} muted={isMuted} onError={() => setMuted(true)} />
      </View>
    </View>
  );
}
