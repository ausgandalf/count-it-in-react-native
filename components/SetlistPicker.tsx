import { SetlistType } from '@/constants/Types';
import { getColors } from '@/functions/common';
import React, { useCallback, useEffect, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Svg, { Text as SvgText } from 'react-native-svg';

const SetlistPicker = ({ viewMode, selected, setlist, commonStyles, onChange }: { viewMode: string, selected: SetlistType|undefined, setlist: SetlistType[], commonStyles: any, onChange: (value: string) => void }) => {

  // Controlled open state
  const [open, setOpen] = useState(false);
  // Controlled value (key of selected item)
  const [value, setValue] = useState<string>('');
  // Items for dropdown picker
  const [items, setItems] = useState([]);
  const [selectedSetlist, setSelectedSetlist] = useState<SetlistType | undefined>(selected);

  const getFirstItem = useCallback(
    () => ((viewMode == 'songs') ? {value: '', label: '— Select a Setlist —'} : {value: '', label: '↵ Back to Home'}), 
    [viewMode]
  );

  const restoreSelectedSetlist = useCallback((selected:SetlistType | undefined) => {
    if (selected) {
      // console.log('SetListPicker: ', selected);
      const foundSetlist = setlist.find((item:any) => item.id == selected.id)
      if (foundSetlist) {
        if (value != selected.id) setValue(selected.id);
      } else {
        setValue('');
      }
      setSelectedSetlist(foundSetlist);
    } else {
      setValue('');
      setSelectedSetlist(undefined);
    }
  }, [selected]);

  useEffect(() => {
    const dropdownData = setlist.map((item:any) => ({value: item.id, label: item.name + `  ( ${item.songs.length} )`})).slice(0, 5);
    if (dropdownData.length < 5) dropdownData.unshift({value: 'create', label: '➕ Create Setlist'});
    dropdownData.unshift(getFirstItem());
    setItems(dropdownData);
    restoreSelectedSetlist(selected);
  }, [setlist, viewMode])

  useEffect(() => {
    restoreSelectedSetlist(selected);
  }, [selected]);
  
  // On change handler
  const onChangeValue = (v: any) => {
    // TODO
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
      listMode='SCROLLVIEW'
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
