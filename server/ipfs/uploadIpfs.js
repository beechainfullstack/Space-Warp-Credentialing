import * as dotenv from "dotenv"
dotenv.config()
import { create as ipfsClient } from "ipfs-http-client"
import fetch from "node-fetch"
const projectId = process.env.INFURA_PROJECT_ID //put infura id
const projectSecret = process.env.INFURA_API_KEY_SECRET //put infura secret
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64")
console.log(projectId, projectSecret)
const client = ipfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: auth,
    },
})

export default async function ipfsUpload(miner) {
    const date = Date.now().toLocaleString()
    let image
    const reputationScore = miner.scores.total
    if (reputationScore >= 90) {
        const response = await fetch("http://localhost:3000/blue.png")
        image = await response.arrayBuffer()
    } else if (reputationScore >= 80) {
        const response = await fetch("http://localhost:3000/green.png")
        image = await response.arrayBuffer()
    } else {
        const response = await fetch("http://localhost:3000/yellow.png")
        image = await response.arrayBuffer()
    }
    //console.log(image)
    const result = await client.add(image)
    let imagePath = `https://nftstorage.link/ipfs/${result.path}`
    const file = {
        path: "/",
        content: JSON.stringify({
            name: "Credential",
            attributes: {
                minerId: miner.address,
                reputationScore: miner.score,
                rawPower: miner.rawPower,
                region: miner.region,
            },
            image: imagePath,
            description: `Credential for ${miner.address}, scores provided by filrep.io and updated on ${date}`,
        }),
    }

    const res = await client.add(file)
    console.log(res)
    return res.path
}
