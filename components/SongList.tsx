import { getCommonStyles } from '@/constants/Styles';
import { getColors } from '@/functions/common';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';

import { SongType } from '@/constants/Types';

export default function SongList({ type = 'select', songs = [], viewMode = 'songs', onUpdate = () => {}, onSelect = () => {}, onDelete = () => {}, openForm = () => {} }: {
  type?: 'button' | 'select',
  songs: SongType[],
  viewMode: 'songs' | 'setlist',
  onUpdate: (type:string, v:any) => void,
  onSelect: (song: SongType) => void,
  onDelete: (songId: string[]) => void,
  openForm?: (isCreate:boolean, song:null|SongType) => void,
}) {

  const { height: windowHeight } = useWindowDimensions();
  const eightyVh = windowHeight - 185;

  const themeColors = getColors();
  const commonStyles = getCommonStyles();
  const styles = StyleSheet.create({
    container: {
      // flex: 1,
      width: '100%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: themeColors.borderLight,
      paddingInline: 20,
    },
    closeHeader: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: themeColors.borderLight,
      paddingInline: 20,
    },
    body: {
      // flex: 1,
      width: '100%',
      maxHeight: eightyVh,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: themeColors.borderLight,
    },
    rowInner: {
      paddingVertical: 12,
    },
  });

  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentViewMode, setCurrentViewMode] = useState<string>(viewMode);
  useEffect(() => {
    setCurrentViewMode(viewMode);
  }, [viewMode]);
  
  //   const isAllSelected = (songs.length > 0) && (selectedIds.length === songs.length);
  const isAllSelected = useCallback(() => {
    if (!songs || songs.length == 0) return false;
    const ids = songs.filter(song => (!song.isLabel || song.isLabel != 1)).map((s) => s.id);
    let hasAll = ids.length > 0;
    ids.some(id => {
      if (id && selectedIds.indexOf(id) == -1) {
        hasAll = false;
        return true;
      }
    })
    return hasAll;
  }, [songs, selectedIds]);

  const isGroupSelected = (label:string) => {
    if (!songs) return false;
    const ids = songs.filter(song => (song.label == label)&&(!song.isLabel || song.isLabel != 1)).map((s) => s.id);
    let hasAll = ids.length > 0;
    ids.some(id => {
      if (id && selectedIds.indexOf(id) == -1) {
        hasAll = false;
        return true;
      }
    })
    return hasAll;
  };

  const isSongSelected = () => {
    let isSelected = false;
    return songs.some(song => {
      if (!song.isLabel || song.isLabel != 1) {
        if (selectedIds.includes(song.id ?? '')) {
          isSelected = true;
          return true;
        }
      }
    });
  }

  const onAddtoSetlist = () => {
    if (!isSongSelected()) return;
    // TODO : Add to setlist
    setTimeout(() => {
      onUpdate('openSongListModal', false);
    }, 1);

    const songsSelected = songs.filter(song => selectedIds.includes(song.id ?? '') && (!song.isLabel || song.isLabel != 1));
    onUpdate('onAddSongsToSetlist', songsSelected);

    setSelectedIds([]);

  }

  const toggleSelectAll = () => {
    if (!songs) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(isAllSelected() ? [] : songs.map(song => song.id).filter(id => id != undefined));
  };

  const toggleSong = (item: SongType, flag: boolean) => {
    const id = item.id;
    const label = item.name;
    if (item.isLabel) {
      const ids = songs.filter(song => song.label == label).map((s) => s.id).filter(id => id != undefined);
      setSelectedIds(prev =>
        flag ? [...prev, ...ids].filter(id => id != undefined) : prev.filter(sid => ids.indexOf(sid) == -1)
      );
    } else {
      setSelectedIds(prev =>
        flag ? [...prev, id].filter(id => id != undefined) : prev.filter(sid => sid !== id)
      );
    }
  };

  const deleteSelected = () => {
    // TODO : Delete action
    onDelete(selectedIds);
    setSelectedIds([]);
  };

  const renderItem = ({ item, index }: { item: SongType, index:number }) => {
    if (!songs) return null;
    const isLast = index === songs.length - 1;
    return (
      <View style={[styles.row, isLast ? {borderBottomWidth: 0, paddingBlockEnd: 40} : {}]}>

        <TouchableOpacity 
          activeOpacity={0.8}
          style={[commonStyles.icon, styles.rowInner]} 
          onPress={() => {
            toggleSong(item, !selectedIds.includes(item.id ?? ''));
          }}
        >
          <Checkbox
            value={item.isLabel ? isGroupSelected(item.name) : selectedIds.includes(item.id ?? '')}
            // onValueChange={(v) => {
            //   toggleSong(item, v);
            // }}
            style={[commonStyles.checkbox, {pointerEvents: 'none'}]}
            color={themeColors.checkbox.color}
          />
        </TouchableOpacity>
        
        {(item.isLabel && item.isLabel == 1) ? (
          <TouchableOpacity 
            activeOpacity={0.8}
            // onPress={() => onSelect(item)} 
            onPress={() => {
              toggleSong(item, !isGroupSelected(item.name));
            }} 
            style={[styles.rowInner, {flex: 1}]}
          >
            <Text style={[commonStyles.text, styles.rowInner, {fontSize: 20, color: themeColors.label}]}>{item.name}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            activeOpacity={0.8}
            // onPress={() => onSelect(item)} 
            onPress={() => {
              if (currentViewMode == 'setlist') {
                toggleSong(item, !selectedIds.includes(item.id ?? ''));
              } else {
                onSelect(item);
              }
            }} 
            style={[styles.rowInner, {flex: 1}]}
          >
            <Text style={commonStyles.text}>{item.name}{item.artist ? ` - ${item.artist}` : ``}</Text>
          </TouchableOpacity>
        )}


        {(!(item.isLabel && item.isLabel == 1)) && (
          <TouchableOpacity activeOpacity={0.8} style={[commonStyles.icon, {marginRight: 20}]} onPress={() => openForm(false, item)}>
            <Ionicons name="create-outline" size={30} color="#777" />
          </TouchableOpacity>
        )}
        
        {(!(item.isLabel && item.isLabel == 1)) ? (
          <TouchableOpacity activeOpacity={0.8} style={[commonStyles.icon]} onPress={() => onDelete([item.id ?? ''])}>
            <Ionicons name="trash-outline" size={30} color="#d11a2a" />
          </TouchableOpacity>
        ) : (
          <></>
        )}

      </View>
    )
  };

  return (
    <View style={styles.container}>
      <View style={styles.closeHeader}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => onUpdate('openSongListModal', false)} style={[commonStyles.icon, {width: 30}]}>
          {/* <Ionicons name="trash-bin" size={20} color="#d11a2a" /> */}
          <Ionicons name="close-circle-outline" size={30} color="#d11a2a" />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Checkbox
          value={isAllSelected()}
          onValueChange={toggleSelectAll}
          style={[commonStyles.checkbox, {marginLeft: 7}]}
          color={themeColors.checkbox.color}
        />
        

        <View style={{flex: 1, gap: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          {currentViewMode == 'setlist' && (
            <TouchableOpacity disabled={!isSongSelected()} style={[commonStyles.button, isSongSelected() ? commonStyles.secondaryButton : commonStyles.disabledButton]} onPress={() => onAddtoSetlist()}>
              <Text style={commonStyles.buttonText}>Add to 📋</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[commonStyles.button, commonStyles.primaryButton]} onPress={() => openForm(true, null)}>
            <Text style={commonStyles.buttonText}>Create ♫</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={deleteSelected} style={{...commonStyles.icon, opacity : isSongSelected() ? 1 : 0}}>
          {/* <Ionicons name="trash-bin" size={20} color="#d11a2a" /> */}
          <Ionicons name="trash-outline" size={30} color="#d11a2a" />
        </TouchableOpacity>

      </View>

      <View style={styles.body}>
        <FlatList
          data={songs ?? []}
          keyExtractor={(item) => item.id ?? ''}
          renderItem={renderItem}          
          contentContainerStyle={{ paddingInline: 20, minHeight: 100 }}
          ListEmptyComponent={() => (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={commonStyles.text}>No songs found.</Text>
            </View>
          )}
        />
      </View>
     
    </View>
  );
}
