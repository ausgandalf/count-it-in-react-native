import { getCommonStyles } from '@/constants/Styles';
import { SongType } from '@/constants/Types';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function SongListOwner({ type = 'select', viewMode = 'songs', currentSong, onUpdate = () => {} }: {
  type?: 'button' | 'select',
  viewMode: 'songs' | 'setlist',
  onUpdate: (type:string, v:any) => void;
  currentSong: SongType | null;
}) {

  const [currentViewMode, setViewMode] = useState(viewMode);
  useEffect(() => setViewMode(viewMode), [viewMode]);

  const [selectedSong, setSelectedSong] = useState<SongType | null>(currentSong);
  useEffect(() => {
    setSelectedSong(currentSong);
  }, [currentSong])

  const commonStyles = getCommonStyles();
  
  return (

    <View style={{}}>

      <View style={{width: '100%'}}>
        <TouchableOpacity 
          onPress={() => onUpdate('openSongListModal', true)}
        >
          <View style={[
            commonStyles.button, 
            commonStyles.tertiaryButton, 
            type == 'button' ? {} : commonStyles.full,
            {paddingVertical: 12}
          ]} >
            {type == 'button' ? (
              <Text style={commonStyles.buttonText}>Add a Song</Text>
            ) : (
              <Text style={commonStyles.buttonText}>{selectedSong ? selectedSong.name + (selectedSong.artist ? ' - ' + selectedSong.artist : '') : 'Select a Song'}</Text>
            )}
          </View>
          <Text style={commonStyles.triangle}>▼</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}