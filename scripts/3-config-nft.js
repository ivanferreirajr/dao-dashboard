import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0xEf0e209B614fc2123274A66748f9d4aec58cEAD2");

(async () => {
  try {
    await editionDrop.createBatch([
      {
        name: "Faixa de casca grossa",
        description: "Esse NFT vai te dar acesso ao OssDAO!",
        image: readFileSync("scripts/assets/bjj-black-belt.jpg"),
      },
    ]);
    console.log("✅ Novo NFT criado com sucesso no drop!");
  } catch (error) {
    console.error("falha ao criar o novo NFT", error);
  }
})()