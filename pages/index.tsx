import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import download from "downloadjs";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  getFirestore,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { find } from "lodash";
import React, { useEffect, useState } from "react";

const url = new URL(
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"
);

enum ChordType {
  chord_numbers = "chord_numbers",
  chord_names = "chord_names",
}

enum SongStyle {
  jazz = "jazz",
  bossa_nova = "bossa_nova",
  rock = "rock",
  virtual_insanity = "virtual_insanity",
}

interface Song {
  name: string;
  key: string;
  chord_type: ChordType;
  progression: string;
  tempo: string;
  style: SongStyle;
  custom?: boolean;
}
const songsCollection = collection(
  getFirestore(
    initializeApp({
      apiKey: "AIzaSyAoZ-o_24pkl0dN1q5L3f5jgMYGdJ6ZYhE",
      authDomain: "jammer-328510.firebaseapp.com",
      projectId: "jammer-328510",
      storageBucket: "jammer-328510.appspot.com",
      messagingSenderId: "874868060040",
      appId: "1:874868060040:web:7400247f3a55d92beb143d",
    })
  ),
  "songs"
).withConverter<Song>({
  toFirestore: (song: Song) => song,
  fromFirestore: (snapshot) => snapshot.data() as Song,
});

export default function Home() {
  const [songId, setSongId] = useState<string>();
  const [song, setSong] = useState<Song>();
  const [error, setError] = useState<string>();
  const [name, setName] = useState<string>(
    `Custom Song ${new Date().toDateString()}`
  );
  const [songs, setSongs] = useState<QueryDocumentSnapshot<Song>[]>();
  function getSong(id: string): QueryDocumentSnapshot<Song> {
    return find(songs, (s) => s.id === id);
  }
  useEffect(() => {
    if (song) {
      return;
    }
    onSnapshot(query(songsCollection), (snapshot) => {
      setSongs(snapshot.docs);
      if (!song) {
        setSongId(snapshot.docs[0].id);
        setSong(snapshot.docs[0].data());
      }
    });
  }, [song, songs]);
  return !song ? (
    "Loading"
  ) : (
    <div style={{ margin: "2%", padding: "2%" }}>
      <h1>Jammer</h1>
      <Box
        component="form"
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          <div>
            <ToggleButtonGroup
              style={{ margin: "10px" }}
              color="primary"
              value={songId}
              onChange={(_, id: string) => {
                if (!id) {
                  return;
                }
                setSongId(id);
                setSong(getSong(id).data());
              }}
              exclusive
            >
              {songs.map((songDocument) => {
                const song = songDocument.data();
                return (
                  <ToggleButton key={songDocument.id} value={songDocument.id}>
                    {song.name}
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          </div>
          <div>
            <ToggleButtonGroup
              style={{ margin: "10px" }}
              color="primary"
              value={song.chord_type}
              onChange={(_, chord_type: string) => {
                if (!chord_type) {
                  return;
                }
                const new_song = find(
                  songs,
                  (s) => s.data().chord_type === chord_type
                );
                setSongId(new_song.id);
                setSong(new_song.data());
              }}
              exclusive
            >
              <ToggleButton value={ChordType.chord_names}>Names</ToggleButton>
              <ToggleButton value={ChordType.chord_numbers}>
                Numbers
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div>
            <ToggleButtonGroup
              style={{ margin: "10px" }}
              color="primary"
              value={song.style}
              onChange={(_, value) =>
                value && setSong({ ...song, style: value })
              }
              exclusive
            >
              <ToggleButton value="jazz">Jazz</ToggleButton>
              <ToggleButton value="rock">Rock</ToggleButton>
              <ToggleButton value="bossa_nova">Bossa Nova</ToggleButton>
              <ToggleButton value="virtual_insanity">
                Virtual Insanity
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div>
            <TextField
              fullWidth={true}
              style={{ width: "100%" }}
              required
              id="outlined-required-chords-names"
              label={
                song.chord_type === ChordType.chord_names
                  ? "Chord Names"
                  : "Chord Intervals"
              }
              helperText={
                song.chord_type === ChordType.chord_names
                  ? "space-separated, e.g., 'Fmaj7/G G#13b9'"
                  : "Values 1-7, space-separated"
              }
              onChange={({ target: { value } }) =>
                setSong({ ...song, progression: value })
              }
              value={song.progression}
            />
          </div>
          <TextField
            required
            id="outlined-required-key"
            label="Root Key"
            helperText="e.g., C, F#"
            onChange={({ target: { value } }) =>
              setSong({ ...song, key: value })
            }
            value={song.key}
          />
          <TextField
            required
            id="outlined-required-tempo"
            label="Tempo"
            helperText="60-300"
            onChange={({ target: { value } }) =>
              setSong({ ...song, tempo: value })
            }
            value={song.tempo}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">bpm</InputAdornment>
              ),
            }}
          />
        </div>
        <Stack spacing={2} direction="row">
          <Button
            startIcon={<DownloadIcon />}
            color="success"
            variant="contained"
            onClick={async () => {
              url.search = new URLSearchParams([
                [song.chord_type, song.progression],
                ["key", song.key],
                ["tempo", song.tempo.toString()],
                ["style", song.style.toString()],
              ]).toString();
              const response = await fetch(url.toString());
              if (response.status != 200) {
                setError(JSON.stringify(await response.json(), undefined, 3));
                return;
              }
              setError(undefined);
              const blob = await response.blob();
              download(blob, "jammer.midi");
            }}
          >
            Download Midi
          </Button>
          <TextField
            required
            id="outlined-required-save-name"
            label="New Song Name"
            helperText="Give your new song a name"
            onChange={({ target: { value } }) => setName(value)}
            value={name}
          />
          <Button
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={async () => {
              const new_song = {
                ...song,
                name,
                custom: true,
              };
              const doc = await addDoc(songsCollection, new_song);
              setSongId(doc.id);
              setSong(new_song);
            }}
          >
            Save Song
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            variant="contained"
            onClick={async () => {
              if (!song.custom) {
                alert("Cannot delete protected song!");
                return;
              }
              const new_song = find(songs, (song) => song.id !== songId);
              setSong(new_song.data());
              setSongId(new_song.id);
              deleteDoc(getSong(songId).ref);
            }}
          >
            Delete Song
          </Button>
        </Stack>
      </Box>
      {error && (
        <div>
          <h2>Error</h2>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}
