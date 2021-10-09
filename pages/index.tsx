import { Box, Button, TextField } from "@mui/material";
import download from "downloadjs";
import React, { useState } from "react";

const url = new URL("https://jammer-okdhwptp6q-ew.a.run.app");

export default function Home() {
  const [progression, setProgression] = useState<string>("1 6 2 5");
  const [key, setKey] = useState<string>("C");
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
          />
        </div>
        <Button
          variant="contained"
          onClick={async () => {
            url.search = new URLSearchParams([
              ...progression.split(" ").map((x) => ["chord_numbers", x.trim()]),
              ["key", key],
            ]).toString();
            const response = await fetch(url.toString());
            const blob = await response.blob();
            console.log(response, blob);
            download(blob, "jammer.midi");
          }}
        >
          Download Midi
        </Button>
      </Box>
    </div>
  );
}
