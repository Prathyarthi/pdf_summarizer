import { config } from "dotenv";

config();

import { Client } from "@octoai/client";
import prompts from "prompts";
import pdf from "pdf-parse";
import fs from "fs/promises";
import path from "path";

// require('dotenv').config()
// const { Client } = require("@octoai/client");
// const pdf = require('pdf-parse');
// const prompts = require('prompts');
// const fs = require('fs/promises');
// const path = require('path');
// prompts.override(require('yargs').argv);

const client = new Client(process.env.OCTOAI_KEY);

(async () => {
    try {
        let models = await client.chat.listAllModels().map(
            (model) => {
                return {
                    title: model,
                    value: model
                }
            }
        )

        const modelSelection = await prompts({
            type: "select",
            name: "model",
            message: "What model would you like to use?",
            choices: models,
            initial: 7
        })
        console.log(modelSelection.model);

        const allFiles = await fs.readdir('./files')
        let pdfs = allFiles.filter(file => path.extname(file).toLowerCase() === '.pdf')

        let choices = pdfs.map(pdf => {
            return {
                title: pdf,
                value: pdf
            }
        })

        const pdfSelected = await prompts({
            type: "select",
            name: "pdf",
            message: "What pdf would you like to use?",
            choices: choices
        })

        const dataBuffer = await fs.readFile(`./files/${pdfSelected.pdf}`);

        const text = await pdf(dataBuffer).then(data => {
            return data.text
        })

        const completion = await client.chat.completions.create({
            model: modelSelection.model,
            messages: [
                {
                    "role": "system",
                    "content": "Summarize this pdf document in 10 lines or less"
                },
                {
                    "role": "user",
                    "content": "PDF content:\n" + text
                }
            ]
        });

        fs.writeFile(`./files/${pdfSelected.pdf}`, completion.choices[0].message.content, 'utf8');

        console.log(completion.choices[0].message.content);
    } catch (error) {
        console.error("Error creating completion:", error);
    }
})();
