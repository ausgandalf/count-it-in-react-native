import SetlistPicker from '@/components/SetlistPicker';
import { getCommonStyles } from '@/constants/Styles';
import { SetlistType } from '@/constants/Types';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import SetlistSongs from './SetlistSongs';

export default function SetListView({
  viewMode = 'songs',
  selected = undefined,
  setlist = [],
  onUpdate = () => {},
  modalOpen = false,
}: {
  viewMode:'songs'|'setlist';
  selected: SetlistType | undefined,
  setlist: SetlistType[];
  onUpdate: (type:string, v:any) => void;
  modalOpen: boolean;
}) {
  
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [selectedSetlist, setSelectedSetlist] = useState<SetlistType>();
  const [isModalOpen, setIsModalOpen] = useState(modalOpen);

  useEffect(() => {
    setIsModalOpen(modalOpen);
  }, [modalOpen]);

  useEffect(() => {
    if (selected) {
      setSelectedSetlist(selected);
    }
  }, [selected]);

  useEffect(() => {
    setCurrentViewMode(viewMode);
  }, [viewMode]);

  const onSetlistSelected = (setlistId:string) => {
    if (setlistId == 'create') {
      //
      onUpdate('openSetlistFormModal', true);
    } else if (setlistId == '') {
      // onUpdate('setViewMode', 'songs');
      onUpdate('selectSetlist', undefined);
    } else {
      onUpdate('selectSetlist', setlist.find((item) => item.id == setlistId ));
    }
  }

  const commonStyles = getCommonStyles();

  return (
    <View style={{gap: 10}}>

      <SetlistPicker 
        viewMode={currentViewMode}
        selected={selectedSetlist}
        setlist={setlist}
        commonStyles={commonStyles}
        onChange={onSetlistSelected}
      />

      <View style={[commonStyles.sub, {display: (viewMode == 'songs') ? 'none' : 'flex'}]}>
        <SetlistSongs setlist={selectedSetlist} onUpdate={onUpdate} scrollable={!isModalOpen} />
      </View>
      
    </View>
  );
}