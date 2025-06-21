import { getCommonStyles } from '@/constants/Styles';
import { useColorScheme } from '@/hooks/useColorScheme';

import { SongType } from '@/constants/Types';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import SongForm from './SongForm';
import SongList from './SongList';

export default function SongListOwner({ type = 'select', songs = [], onSelect, onUpdate }: {
  type?: 'button' | 'select',
  songs?: SongType[];
  onSelect: (song: SongType) => void;
  onUpdate: (type:string, v:any) => void;
}) {

  const [isSongListModalVisible, setSongListModalVisible] = useState(false);
  const toggleSongListModal = () => setSongListModalVisible(!isSongListModalVisible);

  const [isSongFormModalVisible, setSongFormModalVisible] = useState(false);
  const toggleSongFormModal = () => setSongFormModalVisible(!isSongFormModalVisible);

  const inputRef = useRef<TextInput>(null);
  useEffect(() => {
    if (isSongFormModalVisible) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isSongFormModalVisible]);

  const [songList, setSongList] = useState<SongType[]>(songs);
  useEffect(() => {
    setSongList(songs);
  }, [songs])

  const [selectedSong, setSelectedSong] = useState<SongType>();
  const [editingSong, setEditingSong] = useState<null|SongType>();

  const commonStyles = getCommonStyles();
  const colorScheme = useColorScheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
  });

  const openSongForm = (isCreate:boolean, song:null|SongType) => {
    setSongFormModalVisible(true);
    if (!isCreate && song) {
      setEditingSong(song);
    } else {
      setEditingSong(null);
    }
  }

  return (

    <View style={styles.container}>
      <TouchableOpacity style={[[commonStyles.button, commonStyles.tertiaryButton], type == 'button' ? {} : commonStyles.full]} onPress={toggleSongListModal}>
        {type == 'button' ? (
          <Text style={commonStyles.buttonText}>Add a Song</Text>
        ) : (
          <Text style={commonStyles.buttonText}>{selectedSong ? selectedSong.name : 'Select A Song'}</Text>
        )}
        <Text style={commonStyles.triangle}>▼</Text>
      </TouchableOpacity>

      <Modal
        isVisible={isSongListModalVisible}
        onBackdropPress={toggleSongListModal}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={[commonStyles.modal]}
      >
        <View style={commonStyles.overlay}>
          <View style={[commonStyles.modalBox, { zIndex: 1 }]}>
            <SongList 
              songs={songList} 
              onSelect={(song) => {
                setSongListModalVisible(false);
                setSelectedSong(song);
                onSelect(song);
              }} 
              openForm={openSongForm}
            />
          </View>
        </View>
      </Modal>


      <Modal 
        isVisible={isSongFormModalVisible} 
        onBackButtonPress={toggleSongFormModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={[commonStyles.modal, {padding: 20}]}
      >
        <View style={[commonStyles.overlay, {justifyContent: 'center',}]}>
          <View style={[commonStyles.modalBox, { zIndex: 1, borderRadius: 10 }]}>
            <SongForm 
              inputRef={inputRef}
              song={editingSong}
              onSubmit={(song: { id: string, name: string; artist: string; bpm: number }) =>{
                // TODO - Song list update
                setSongFormModalVisible(false);
                onUpdate('song', song);
              }}
              onCancel={() =>{
                setSongFormModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}