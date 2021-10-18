import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import download from "downloadjs";
import React, { useState } from "react";

const url = new URL(
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"
);

enum ChordType {
  chord_numbers = "chord_numbers",
  chord_names = "chord_names",
}

interface Song {
  name: string;
  key: string;
  chord_type: ChordType;
  progression: string;
  tempo: string;
}

const songs: Song[] = [
  {
    name: "Stand By Me",
    key: "C",
    chord_type: ChordType.chord_numbers,
    progression: "1 1 6 6 4 5 1 1",
    tempo: "120",
  },
  {
    name: "LAX",
    key: "C",
    chord_type: ChordType.chord_names,
    progression: "Dm7 G7 Cmaj7 A7b9",
    tempo: "128",
  },
  {
    name: "The Girl From Ipanema",
    key: "F",
    chord_type: ChordType.chord_names,
    progression:
      "fmaj7 fmaj7 g13 g13 gm7 f#7b5 fmaj7 f#7b5 fmaj7 fmaj7 g13 g13 gm7 f#7b5 fmaj7 f#7b5 F#maj7 F#maj7 B9 B9 F#m7 F#m7 D9 D9 Gm7 Gm7 Eb9 Eb9 Am7 Abm7 Gm7 F#7b5 fmaj7 fmaj7 g13 g13 gm7 f#7b5 fmaj7 f#7b5",
    tempo: "130",
  },
  {
    name: "Anthropology",
    key: "Bb",
    chord_type: ChordType.chord_names,
    progression:
      "Bb6 G7#5 | Cm7 F7 | Bbmaj7 Gm7 | Cm7 F7 | Fm7 Bb7 | Eb7 Ab7 | Dm7 G7b9 | Cm7 F7 | Bb6 G7#5 | Cm7 F7 | Bbmaj7 Gm7 | Cm7 F7 | Fm7 Bb7 | Eb7 Ab7 | Cm7 F7 | Bb6 | D7 | D7 | G7 | G7 | C7 | C7 | F7 | F7 | Bb6 G7#5 | Cm7 F7 | Bbmaj7 Gm7 | Cm7 F7 | Fm7 Bb7 | Eb7 Ab7 | Cm7 F7 | Bb6",
    tempo: "180",
  },
  {
    name: "Sunday Morning",
    key: "C",
    chord_type: ChordType.chord_numbers,
    progression: "2 5 1 1",
    tempo: "176",
  },
  {
    name: "Piano w/ Jonny",
    key: "C",
    chord_type: ChordType.chord_numbers,
    progression: "1 2 3 4 5 6 7 8 8 7 6 5 4 3 2 1",
    tempo: "180",
  },
];

function getSong(song_name: string): Song {
  return songs.filter(({ name }) => name === song_name)[0];
}
export default function Home() {
  const [song, setSong] = useState(getSong("Stand By Me"));
  const [error, setError] = useState<string>();
  return (
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
              value={song.name}
              onChange={(
                event: React.MouseEvent<HTMLElement>,
                song_name: string
              ) => setSong(getSong(song_name))}
              exclusive
            >
              {songs.map((song) => (
                <ToggleButton key={song.name} value={song.name}>
                  {song.name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div>
            <ToggleButtonGroup
              style={{ margin: "10px" }}
              color="primary"
              value={song.chord_type}
              onChange={() =>
                setSong(
                  song.chord_type === ChordType.chord_numbers
                    ? getSong("LAX")
                    : getSong("Stand By Me")
                )
              }
              exclusive
            >
              <ToggleButton value={ChordType.chord_names}>Names</ToggleButton>
              <ToggleButton value={ChordType.chord_numbers}>
                Numbers
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
        <Button
          startIcon={<DownloadIcon />}
          variant="contained"
          onClick={async () => {
            url.search = new URLSearchParams([
              ...(song.chord_type === ChordType.chord_numbers
                ? song.progression
                    .split(" ")
                    .map((x) => x.trim())
                    .filter((x) => x)
                    .map((x) => ["chord_numbers", x])
                : []),
              ...(song.chord_type === ChordType.chord_names
                ? [["chord_names", song.progression]]
                : []),
              ["key", song.key],
              ["tempo", song.tempo.toString()],
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
