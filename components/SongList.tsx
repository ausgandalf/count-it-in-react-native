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

export default function SongList({ type = 'select', songs = [], onSelect = () => {}, onDelete = () => {}, openForm = () => {} }: {
  type?: 'button' | 'select',
  songs?: SongType[],
  onSelect: (song: SongType) => void,
  onDelete: (songId: string[]) => void,
  openForm?: (isCreate:boolean, song:null|SongType) => void,
}) {
  
  const [songList, setSongList] = useState(songs);
  useEffect(() => {
    setSongList(songs);
  }, [songs])

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
    body: {
      // flex: 1,
      width: '100%',
      maxHeight: eightyVh,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: themeColors.borderLight,
    },
  });

  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  //   const isAllSelected = (songList.length > 0) && (selectedIds.length === songList.length);
  const isAllSelected = useCallback(() => {
    if (songList.length == 0) return false;
    const ids = songList.filter(song => (!song.isLabel || song.isLabel != 1)).map((s) => s.id);
    let hasAll = true;
    ids.some(id => {
      if (selectedIds.indexOf(id) == -1) {
        hasAll = false;
        return true;
      }
    })
    return hasAll;
  }, [songList, selectedIds]);
  const isGroupSelected = (label:string) => {
    const ids = songList.filter(song => (song.label == label)&&(!song.isLabel || song.isLabel != 1)).map((s) => s.id);
    let hasAll = true;
    ids.some(id => {
      if (selectedIds.indexOf(id) == -1) {
        hasAll = false;
        return true;
      }
    })
    return hasAll;
  };

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected() ? [] : songList.map(song => song.id));
  };

  const toggleSong = (item: SongType, flag: boolean) => {
    const id = item.id;
    const label = item.name;
    if (item.isLabel) {
      const ids = songList.filter(song => song.label == label).map((s) => s.id);
      setSelectedIds(prev =>
        flag ? [...prev, ...ids] : prev.filter(sid => ids.indexOf(sid) == -1)
      );
    } else {
      setSelectedIds(prev =>
        flag ? [...prev, id] : prev.filter(sid => sid !== id)
      );
    }
  };

  const deleteSelected = () => {
    // TODO : Delete action
    onDelete(selectedIds);
    setSelectedIds([]);
  };

  const renderItem = ({ item, index }: { item: SongType, index:number }) => {
    const isLast = index === songList.length - 1;
    return (
      <View style={[styles.row, isLast ? {borderBottomWidth: 0, paddingBlockEnd: 40} : {}]}>
        <Checkbox
          value={item.isLabel ? isGroupSelected(item.name) : selectedIds.includes(item.id)}
          onValueChange={(v) => {
            toggleSong(item, v);
          }}
          style={commonStyles.checkbox}
          color={themeColors.checkbox.color}
        />
        
        {(item.isLabel && item.isLabel == 1) ? (
          <Text style={[commonStyles.text, {fontSize: 20, color: themeColors.label}]}>{item.name}</Text>
        ) : (
          <TouchableOpacity 
            onPress={() => onSelect(item)} 
            style={{flex: 1}}
          >
            <Text style={commonStyles.text}>{item.name}{item.artist ? ` - ${item.artist}` : ``}</Text>
          </TouchableOpacity>
        )}

        {(!(item.isLabel && item.isLabel == 1) && (item.isCustom)) ? (
          <TouchableOpacity style={commonStyles.icon} onPress={() => onDelete([item.id])}>
            <Ionicons name="trash-outline" size={20} color="#d11a2a" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={commonStyles.icon}>
            
          </TouchableOpacity>
        )}

        {!(item.isLabel && item.isLabel == 1) && (
          <TouchableOpacity style={commonStyles.icon} onPress={() => openForm(false, item)}>
            <Ionicons name="create-outline" size={20} color="#777" />
          </TouchableOpacity>
        )}

      </View>
    )
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Checkbox
          value={isAllSelected()}
          onValueChange={toggleSelectAll}
          style={commonStyles.checkbox}
          color={themeColors.checkbox.color}
        />
        <TouchableOpacity style={[commonStyles.button, commonStyles.primaryButton]} onPress={() => openForm(true, null)}>
          <Text style={commonStyles.buttonText}>Create Song</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteSelected} style={commonStyles.icon}>
          <Ionicons name="trash-bin" size={20} color="#d11a2a" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <FlatList
          data={songList}
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
