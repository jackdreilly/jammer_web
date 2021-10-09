import { Button, TextField } from "@mui/material";
import download from "downloadjs";
import { useState } from "react";

const url = new URL("https://jammer-okdhwptp6q-ew.a.run.app");

export default function Home() {
  const [progression, setProgression] = useState<string>("1 5 2 6");
  return (
    <div style={{ margin: "10%", padding: "10%" }}>
      <TextField
        onChange={({ target: { value } }) => setProgression(value)}
        value={progression}
      ></TextField>
      <Button
        onClick={async () => {
          url.search = new URLSearchParams(
            progression.split(" ").map((x) => ["chord_numbers", x.trim()])
          ).toString();
          const response = await fetch(url.toString());
          const blob = await response.blob();
          console.log(response, blob);
          download(blob, "jammer.midi");
        }}
      >
        Submit
      </Button>
    </div>
  );
}
