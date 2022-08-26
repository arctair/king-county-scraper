import axios from 'axios'

async function main() {
  const response = await axios.get(
    `https://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/KingCo_AddressPoints/MapServer/0/query`,
    {
      params: new URLSearchParams({
        f: 'json',
        returnGeometry: 'true',
        spatialRel: 'esriSpatialRelIntersects',
        geometry: decodeURIComponent(
          '%7B%22xmin%22%3A-13599531.826702124%2C%22ymin%22%3A6055711.645073277%2C%22xmax%22%3A-13599503.312575594%2C%22ymax%22%3A6055740.159199806%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%7D',
        ),
        geometryType: 'esriGeometryEnvelope',
        inSR: '102100',
        outFields: decodeURIComponent('ADDR_FULL%2COBJECTID'),
        outSR: '102100',
      }),
    },
  )

  process.stdout.write(JSON.stringify(response.data))
}

main()
