import SetlistPicker from '@/components/SetlistPicker';
import { getCommonStyles } from '@/constants/Styles';
import { SetlistType } from '@/constants/Types';
import React, { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import Modal from 'react-native-modal';
import SetlistForm from './SetlistForm';
import SetlistSongs from './SetlistSongs';

export default function SetListView({
  viewMode = 'songs',
  selected = null,
  setlist = [],
  onUpdate = () => {},
}: {
  viewMode:'songs'|'setlist';
  selected: SetlistType | null,
  setlist: SetlistType[];
  onUpdate: (type:string, v:any) => void;
}) {
  
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [selectedSetlist, setSelectedSetlist] = useState<SetlistType>();
  const [editingSetlist, setEditingSetlist] = useState<null|SetlistType>();
  const [isSetlistFormModalVisible, setSetlistFormModalVisible] = useState(false);
  const toggleSetlistFormModal = () => setSetlistFormModalVisible(!isSetlistFormModalVisible);

  const inputRef = useRef<TextInput>(null);
  useEffect(() => {
    if (isSetlistFormModalVisible) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isSetlistFormModalVisible]);

  useEffect(() => {
    if (selected) {
      // console.log('SetListView: ', selected);
      setSelectedSetlist(selected);
    }
  }, [selected]);

  useEffect(() => {
    setCurrentViewMode(viewMode);
  }, [viewMode]);

  const onSetlistSelected = (setlistId:string) => {
    if (setlistId == 'create') {
      //
      setSetlistFormModalVisible(true);
    } else if (setlistId == '') {
      onUpdate('setViewMode', 'songs');
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

      {viewMode == 'setlist' && (
        <View style={commonStyles.sub}>
          <SetlistSongs setlist={selectedSetlist} onUpdate={onUpdate} />
        </View>
      )}

      <Modal 
        isVisible={isSetlistFormModalVisible} 
        onBackButtonPress={toggleSetlistFormModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={[commonStyles.modal, {padding: 20}]}
      >
        <View style={[commonStyles.overlay, {justifyContent: 'center',}]}>
          <View style={[commonStyles.modalBox, { zIndex: 1, borderRadius: 10 }]}>
            <SetlistForm 
              inputRef={inputRef}
              setlist={editingSetlist}
              onSubmit={(setlist: { id: string, name: string; }) =>{
                // TODO - Setlist list update
                setSetlistFormModalVisible(false);
                onUpdate('updateSetlist', setlist);
              }}
              onCancel={() =>{
                setSetlistFormModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
      
    </View>
  );
}