import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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

export default function Home() {
  const [chord_type, set_chord_type] = useState<ChordType>(
    ChordType.chord_names
  );
  const [progression, setProgression] = useState<string>("C G Am F");
  const [key, setKey] = useState<string>("C");
  const [tempo, setTempo] = useState<string>("150");
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
              value={chord_type}
              exclusive
              onChange={(
                event: React.MouseEvent<HTMLElement>,
                new_chord_type: ChordType
              ) => {
                set_chord_type(new_chord_type);
                setProgression(
                  new_chord_type === ChordType.chord_numbers
                    ? "1 1 4 5"
                    : "C G Am F"
                );
              }}
            >
              <ToggleButton value={ChordType.chord_names}>Names</ToggleButton>
              <ToggleButton value={ChordType.chord_numbers}>
                Numbers
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          {chord_type == ChordType.chord_numbers ? (
            <>
              <TextField
                required
                id="outlined-required-chords"
                label="Chord Intervals"
                helperText="Values 1-7, space-separated"
                onChange={({ target: { value } }) => setProgression(value)}
                value={progression}
              />
              <TextField
                required
                id="outlined-required-key"
                label="Root Key"
                helperText="e.g., C, F#"
                onChange={({ target: { value } }) => setKey(value)}
                value={key}
              />{" "}
            </>
          ) : (
            <div>
              <TextField
                fullWidth={true}
                style={{width: "100%"}}
                required
                id="outlined-required-chords-names"
                label="Chord Names"
                helperText="space-separated, e.g., 'Fmaj7/G G#13b9'"
                onChange={({ target: { value } }) => setProgression(value)}
                value={progression}
              />
            </div>
          )}
          <TextField
            required
            id="outlined-required-tempo"
            label="Tempo"
            helperText="60-300"
            onChange={({ target: { value } }) => setTempo(value)}
            value={tempo}
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
              ...(chord_type === ChordType.chord_numbers
                ? progression
                    .split(" ")
                    .map((x) => x.trim())
                    .filter((x) => x)
                    .map((x) => ["chord_numbers", x])
                : []),
              ...(chord_type === ChordType.chord_names
                ? [["chord_names", progression]]
                : []),
              ["key", key],
              ["tempo", tempo],
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
