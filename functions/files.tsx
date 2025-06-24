export function parseSetlistCSV(csvText:string, defaultSetlistName = 'imported') {
  const setlists:any = {};

  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val =>
      val.replace(/^"|"$/g, "").replace(/""/g, '"').trim()
    );

    const obj:any = {};
    ['name', 'artist', 'bpm'].forEach((key, i) => {
      obj[key] = key === "bpm" ? 120 : '';
    });

    let setlistName = defaultSetlistName;
    headers.forEach((key:string, i:number) => {
      if (['setlist', 'name', 'artist', 'bpm'].indexOf(key) == -1) return;
      if (key === 'setlist') {
        // setlistName = values[i];
      } else {
        obj[key] = key === "bpm" ? Number(values[i]) : values[i];
      }
    });
    
    if (obj.name == '') {
      return;
    }

    if (setlistName in setlists) {
      setlists[setlistName].songs.push(obj);
    } else {
      setlists[setlistName] = {
        name: setlistName,
        songs: [obj]
      };
    }
  });

  return setlists;
}

export function getFileNameWithoutExtension(filename:string) {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return filename; // No extension found
  }
  return filename.substring(0, lastDotIndex);
}