import dayjs from 'dayjs'

interface MarketplaceRecord {
  url: string
  fbID: string
  last_price: number
  last_seen: string
  title: string
  location: string
  miles: number
  status: string
}

const marketplaceID = 'appci2SPrSoo1fQyC/Catalog'

/*
Airtable.setCatalog(data)
  .then((r) => Promise.all(r.map((i) => i.json())))
  .then((r) => r.flat())
  .then((r) => console.log(r))
  .catch((e) => console.log(e.message))
*/

export default class Airtable {
  static async setCatalog(listings: MarketplaceRecord | MarketplaceRecord[]) {
    const index = Array.of(listings).flat()

    const records = index.map((item) => ({
      fields: {
        'Facebook ID': item.fbID,
        Title: item.title,
        Price: item.last_price,
        Miles: item.miles,
        Location: item.location,
        'Last Seen': dayjs(item.last_seen).format('YYYY-MM-DD'),
        URL: item.url,
        Status: item.status,
      },
    }))

    // Airtable can only handle 10 records at a time
    // Split the records into chunks of 10
    const chunks = []
    for (let i = 0; i < records.length; i += 10) {
      chunks.push(records.slice(i, i + 10))
    }

    return Promise.all(
      chunks.map((records) =>
        fetch(`https://api.airtable.com/v0/${marketplaceID}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_KEY}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify({
            performUpsert: {
              fieldsToMergeOn: ['Facebook ID'],
            },
            records,
            typecast: true,
          }),
        })
      )
    )
  }
}
