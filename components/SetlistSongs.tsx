import { getCommonStyles } from '@/constants/Styles';
import { SetlistType, SongType } from '@/constants/Types';
import { confirm, getColors } from '@/functions/common';
import { Ionicons } from '@expo/vector-icons'; // or use any icon lib
import Checkbox from 'expo-checkbox';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import ImportSetlistButton from './ImportSetlistButton';
import InnerShadow from './InnerShadow';

export default function SetlistSongs({ setlist, scrollable, onUpdate }: {
  setlist?: SetlistType,
  scrollable: boolean,
  onUpdate: (type:string, v:any) => void,
}) {

  const scrollRef = useRef(null);
  const [isAddMode, setAddMode] = useState(true);
  const [currentSetlist, setCurrentSetlist] = useState<SetlistType | null>(null);
  const [data, setData] = useState<SongType[]>(setlist ? setlist.songs : []);
  const [dataIds, setDataIds] = useState<string[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setCurrentSetlist(setlist || null);
    if (JSON.stringify(data) != JSON.stringify(setlist?.songs)) {
      setData(setlist ? [...setlist.songs] : []);
      setDataIds(setlist ? setlist.songs.map((s) => s.id ?? '') : []);
    }
  }, [setlist])

  useEffect(() => {
    let selectFirstItem = true;
    if ( currentSetlist && currentSetlist.songs.length > 0) {
      if (selectedSongId) {
        const selectedSong = currentSetlist.songs.find((item) => item.id == selectedSongId);
        if (selectedSong) selectFirstItem = false;
      }
      if (selectFirstItem) {
        setSelectedSongId(currentSetlist.songs[0].id ?? '');
        onUpdate('selectSongOnList', currentSetlist.songs[0]);
      }
    }
  }, [currentSetlist])

  const { height: windowHeight } = useWindowDimensions();
  const songlistMaxHeight = Math.max(80, windowHeight - 620);

  const commonStyles = getCommonStyles();
  const themeColors = getColors();
  const renderItem = (info: DragListRenderItemInfo<string>) => {
    const {item, onDragStart, onDragEnd, isActive} = info;
    const song = data.find((s) => s.id == item);
    return (
      <View
        key={item}
        style={[
          styles.row,
          commonStyles.item,
          isActive ? {opacity: 0.9} : {},
          selectedSongId == item ? commonStyles.selected: {}
        ]}
      >
        <TouchableOpacity
          onPressIn={onDragStart}
          onPressOut={onDragEnd}
          style={[styles.handle, {paddingBlock: 16, paddingInlineStart: 16}]}
        >
          <Ionicons name="reorder-three" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            setSelectedSongId(item);
            onUpdate('selectSongOnList', song);
          }}
          style={{flex: 1, paddingBlock: 16}}
        >
          <Text style={commonStyles.text}>{song?.name}{song?.artist ? ` - ${song.artist}` : ``}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            onUpdate('deleteSongFromSetlist', song);
          }}
          style={{paddingBlock: 16, paddingInlineEnd: 16}}
        >
          <Ionicons name="trash" size={20} color={themeColors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{gap: 20}}>
      <View style={{gap: 10}}>
        <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
          <View>
            <TouchableOpacity style={[commonStyles.buttonSm, commonStyles.primaryButton]} onPress={() => {
              // TODO - Open Add Song Modal
              onUpdate('openSongListModal', true);
            }}>
              <Text style={commonStyles.buttonText}>Add ♫</Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', gap: 6}}>
            <ImportSetlistButton buttonText='Import' onSuccess={onUpdate} />

            <TouchableOpacity style={[commonStyles.buttonSm, commonStyles.secondaryButton]} onPress={() => {
              // TODO - Export
              onUpdate('export', '');
            }}>
              <Text style={commonStyles.buttonText}>Export</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[commonStyles.buttonSm, commonStyles.dangerButton]} onPress={() => {
              // TODO - Delete
              confirm('Confirm', 'Are you sure to delete the setlist?', () => onUpdate('deleteSelectedSetlist', true));
            }}>
              <Text style={commonStyles.buttonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Checkbox
            value={isAddMode}
            style={commonStyles.checkbox}
            color={themeColors.checkbox.color}
            onValueChange={(v) => {
              setAddMode(v);
              onUpdate('setImportMode', v ? 1 : 0);
            }}
          />
          <Text style={commonStyles.text}>Add new songs to library on import.</Text>
        </View>
      </View>
      
      <View style={{zIndex: 1}}>

        <DragList
          data={dataIds}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          onReordered={(fromIndex: number, toIndex: number) => {
            const newDataIds = [...dataIds]; // Don't modify react data in-place
            const removed = newDataIds.splice(fromIndex, 1);
            newDataIds.splice(toIndex, 0, removed[0]); // Now insert at the new pos
            const newDataIdsFiltered = newDataIds.filter((id) => id != '');
            setDataIds(newDataIdsFiltered);
            const newDataSet = newDataIdsFiltered.map((id) => data.find((s) => s.id == id) ?? {id: '', name: '', artist: '', label: '', bpm: 0, isCustom: false, isLabel: 0} as SongType);
            const newData = newDataSet.filter((s) => s.id != '');
            setData(newData);
            onUpdate('updateSetlist', {
              ...currentSetlist,
              songs: newData  
            });
          }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />} // ← gap between items
          ListEmptyComponent={() => (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={commonStyles.text}>No songs found in the setlist.</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 10 }}
          style={[commonStyles.roundBordered, {maxHeight: songlistMaxHeight }]}
        />
  
        <InnerShadow />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
  handle: {
    paddingHorizontal: 4,
  }
});
