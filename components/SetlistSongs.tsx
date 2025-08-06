import { getCommonStyles } from '@/constants/Styles';
import { SetlistType, SongType } from '@/constants/Types';
import { confirm, getColors } from '@/functions/common';
import { Ionicons } from '@expo/vector-icons'; // or use any icon lib
import Checkbox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import ImportSetlistButton from './ImportSetlistButton';
import InnerShadow from './InnerShadow';

export default function SetlistSongs({ setlist, scrollable, onUpdate }: {
  setlist?: SetlistType,
  scrollable: boolean,
  onUpdate: (type:string, v:any) => void,
}) {

  const [isAddMode, setAddMode] = useState(true);
  const [currentSetlist, setCurrentSetlist] = useState<SetlistType | null>(null);
  const [data, setData] = useState<SongType[]>(setlist ? setlist.songs : []);
  const [selectedSongId, setSelectedSongId] = useState<string | undefined>(undefined);
  const [isScrollEnabled, setScrollEnabled] = useState(scrollable);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setCurrentSetlist(setlist || null);
    if (JSON.stringify(data) != JSON.stringify(setlist?.songs)) {
      setData(setlist ? [...setlist.songs] : []);
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
  const renderItem = ({ item, drag, isActive }: { item: SongType, drag: () => void, isActive: boolean }) => (
    <ScaleDecorator>
      <View
        style={[
          styles.row,
          commonStyles.item,
          isActive ? {opacity: 0.9} : {},
          selectedSongId == item.id ? commonStyles.selected: {}
        ]}
      >
        <TouchableOpacity
          onLongPress={() => {
            setIsDragging(true);
            setScrollEnabled(false);
            drag();
          }}
          delayLongPress={200}
          activeOpacity={0.8}
          style={[styles.handle, {paddingBlock: 16, paddingInlineStart: 16}]}
        >
          <Ionicons name="reorder-three" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            setSelectedSongId(item.id);
            onUpdate('selectSongOnList', item);
          }}
          style={{flex: 1, paddingBlock: 16}}
        >
          <Text style={commonStyles.text}>{item.name}{item.artist ? ` - ${item.artist}` : ``}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            onUpdate('deleteSongFromSetlist', item);
          }}
          style={{paddingBlock: 16, paddingInlineEnd: 16}}
        >
          <Ionicons name="trash" size={20} color={themeColors.danger} />
        </TouchableOpacity>
      </View>
    </ScaleDecorator>
  );

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
            <ImportSetlistButton buttonText='📥' onSuccess={onUpdate} />

            <TouchableOpacity style={[commonStyles.buttonSm, commonStyles.secondaryButton]} onPress={() => {
              // TODO - Export
              onUpdate('export', '');
            }}>
              <Text style={commonStyles.buttonText}>📤</Text>
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
        {isDragging && <View style={styles.scrollBlocker} pointerEvents="auto" />}
        <DraggableFlatList
          activationDistance={0}
          scrollEnabled={isScrollEnabled}
          data={data}
          onDragEnd={({ data }) => {
            setIsDragging(false);
            setScrollEnabled(true);
            const newData = JSON.parse(JSON.stringify(data));
            setData(newData);
            onUpdate('updateSetlist', {
              ...currentSetlist,
              songs: newData
            });
          }}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
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
  },
  scrollBlocker: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 999,
  },
});
