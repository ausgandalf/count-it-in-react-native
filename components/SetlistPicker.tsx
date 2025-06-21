import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

const SetlistPicker = ({ viewMode, selected, setlist, commonStyles, onChange }) => {

  // Controlled open state
  const [open, setOpen] = useState(false);
  // Controlled value (key of selected item)
  const [value, setValue] = useState<string>('');
  // Items for dropdown picker
  const [items, setItems] = useState([]);

  const getFirstItem = useCallback(
    () => ((viewMode == 'songs') ? {value: '', label: '— Select a Setlist —'} : {value: '', label: '⮐ Back to Home'}), 
    [viewMode]
  );

  useEffect(() => {
    const dropdownData = setlist.map((item:any) => ({value: item.id, label: item.name})).slice(0, 5);
    if (dropdownData.length < 5) dropdownData.unshift({value: 'create', label: '➕ Create Setlist'});
    dropdownData.unshift(getFirstItem());
    setItems(dropdownData);
  }, [viewMode, setlist])

  useEffect(() => {
    if (selected) {
      console.log('SetListPicker: ', selected);
      setValue(selected.id);
    }
  }, [selected]);
  
  // On change handler
  const onChangeValue = (v: any) => {
    // TODO
    console.log('SetlistPicker value changed to : ', v);
    if (v == 'create') {
      // TODO
      setValue('');
    }
    onChange(v);
  };

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      onChangeValue={onChangeValue}
      searchable={false} // disable search
      style={commonStyles.selectBox}  // container style
      dropDownContainerStyle={[commonStyles.selectItem, {height: items.length * 40 + 10, maxHeight: 'none'}]}  // dropdown container style
      textStyle={[commonStyles.text, { textAlign: 'center' }]} // text inside input
      listItemLabelStyle={[commonStyles.text, { textAlign: 'left' }]}
      ArrowDownIconComponent={() => (
        <Ionicons name="chevron-down" size={20} color="#777" />
      )}
      ArrowUpIconComponent={() => (
        <Ionicons name="chevron-up" size={20} color="#777" />
      )}
    />
  );
};

export default SetlistPicker;
