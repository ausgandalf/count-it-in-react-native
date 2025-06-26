import { getColors } from '@/functions/common';
import React, { useCallback, useEffect, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Svg, { Text as SvgText } from 'react-native-svg';

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
    console.log('SetlistPicker, viewMode:', viewMode, setlist);
    const dropdownData = setlist.map((item:any) => ({value: item.id, label: item.name + `  ( ${item.songs.length} )`})).slice(0, 5);
    if (dropdownData.length < 5) dropdownData.unshift({value: 'create', label: '➕ Create Setlist'});
    dropdownData.unshift(getFirstItem());
    setItems(dropdownData);

    if (!selected) {
      setValue('');
    } else {
      const selectedSetlist = setlist.find((item:any) => item.id == selected.id)
      if (!selectedSetlist) setValue('');
    }

  }, [viewMode, setlist])

  useEffect(() => {
    if (selected) {
      // console.log('SetListPicker: ', selected);
      const selectedSetlist = setlist.find((item:any) => item.id == selected.id)
      if (selectedSetlist) {
        if (value != selected.id) setValue(selected.id);
      } else {
        setValue('');
      }
    } else {
      setValue('');
    }
  }, [selected]);
  
  // On change handler
  const onChangeValue = (v: any) => {
    // TODO
    // console.log('SetlistPicker value changed to : ', v);
    if (v == 'create') {
      // TODO
      setValue('');
    }
    onChange(v);
  };
  const themeColors = getColors();
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
        <Svg height="20" width="20">
          <SvgText
            x="10"
            y="15"
            fontSize="16"
            fill={themeColors.text}
            textAnchor="middle"
          >
            ▼
          </SvgText>
        </Svg>
        // <Ionicons name="chevron-down" size={20} color="#777" />
      )}
      ArrowUpIconComponent={() => (
        <Svg height="20" width="20">
          <SvgText
            x="10"
            y="15"
            fontSize="16"
            fill={themeColors.text}
            textAnchor="middle"
          >
            ▲
          </SvgText>
        </Svg>
        // <Ionicons name="chevron-up" size={20} color="#777" />
      )}
    />
  );
};

export default SetlistPicker;
