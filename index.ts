import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)

async function main() {
  const OUT_LAYER_DIRECTORY = process.env.OUT_LAYER_DIRECTORY
  if (OUT_LAYER_DIRECTORY === undefined)
    throw Error('missing env var OUT_LAYER_DIRECTORY')

  let resultOffset = 0
  let exceededTransferLimit = true
  while (exceededTransferLimit) {
    console.log('getting offset', resultOffset)
    const response = await getResults({ resultOffset })
    await writeFile(
      path.join(OUT_LAYER_DIRECTORY, `${resultOffset}.json`),
      JSON.stringify(response.data),
    )
    resultOffset += response.data.features.length
  }
}

interface getResultsProps {
  resultOffset: number
}
function getResults({ resultOffset }: getResultsProps) {
  return axios.get(
    `https://gismaps.kingcounty.gov/ArcGIS/rest/services/Property/KingCo_Parcels/MapServer/0/query`,
    {
      params: new URLSearchParams({
        f: 'json',
        returnGeometry: 'true',
        spatialRel: 'esriSpatialRelIntersects',
        geometry: JSON.stringify({
          //   xmin: -13599531.826702124,
          xmin: -20037508.34,
          //   ymin: 6055711.645073277,
          ymin: -20037508.34,
          //   xmax: -13599503.312575594,
          xmax: 20037508.34,
          //   ymax: 6055740.159199806,
          ymax: 20037508.34,
          spatialReference: { wkid: 102100 },
        }),
        geometryType: 'esriGeometryEnvelope',
        inSR: '102100',
        outFields: ['OBJECTID', 'PIN'].join(','),
        outSR: '102100',
        resultOffset: resultOffset.toString(),
      }),
    },
  )
}

main()
