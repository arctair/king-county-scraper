import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

async function main() {
  const IN_LAYER_DIRECTORY = process.env.IN_LAYER_DIRECTORY
  if (IN_LAYER_DIRECTORY === undefined)
    throw Error('missing env var IN_LAYER_DIRECTORY')

  const OUT_LAYER_DIRECTORY = process.env.OUT_LAYER_DIRECTORY
  if (OUT_LAYER_DIRECTORY === undefined)
    throw Error('missing env var OUT_LAYER_DIRECTORY')

  const bucketSize = 32

  const files = await readdir(IN_LAYER_DIRECTORY)
  const paths = files.map((file) => path.join(IN_LAYER_DIRECTORY, file))
  for (let index = 0; index < paths.length; index++) {
    const { features } = JSON.parse(
      (await readFile(paths[index])).toString(),
    )
    const pins = features.map(({ attributes }: any) => attributes.PIN)
    for (let offset = 0; offset < pins.length; offset += bucketSize) {
      const destination = `${files[index]}.${offset}.json`
      console.log('getting details for', destination)
      const response = await getDetails({
        pins: pins.slice(offset, offset + bucketSize),
      })
      await writeFile(
        path.join(OUT_LAYER_DIRECTORY, destination),
        JSON.stringify(response.data),
      )
    }
  }
}

interface getDetailsProps {
  pins: string[]
}
function getDetails({ pins }: getDetailsProps) {
  return axios.get(
    `https://gismaps.kingcounty.gov/parcelviewer2/pvinfoquery.ashx`,
    {
      params: new URLSearchParams({
        pin: pins.join(','),
      }),
    },
  )
}

main()
