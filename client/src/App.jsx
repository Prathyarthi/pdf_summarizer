import { useState } from "react";
import axios from 'axios'

export default function App() {

  const [summarize, setSummarize] = useState("");
  function onFileChange(event) {
    const file = event.target.files[0]
    const fileReader = new FileReader()
    fileReader.onload = onLoadFile
    fileReader.readAsArrayBuffer(file)
  }

  function onLoadFile(event) {
    const typedarray = new Uint8Array(event.target.result)
    pdfjsLib.getDocument({
      data: typedarray
    }).promise.then((pdf) => {
      console.log("Loaded.pdf: ", pdf.numPages);
      pdf.getPage(1).then((page) => {
        console.log("Page loaded");

        // Get text from the page
        page.getTextContent().then((textContent) => {
          let text = "";
          textContent.items.forEach((item) => {
            text += item.str + " ";
          });
          sendToAPI(text);
        });
      });
    })
  }

  async function sendToAPI() {
    const response = await axios.post("http://localhost:3000/summarize", {
      text: text
    })

    setSummarize(response.data.summary)
  }

  return (
    <>
      <h1>Upload PDF</h1>
      <input type="file" id="file" name="file" onChange={onFileChange} accept=".pdf" />
      <p>{summarize}</p>
    </>
  )
}
