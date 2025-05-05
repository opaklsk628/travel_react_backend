import 'dotenv/config';
import Amadeus from 'amadeus';

// Amadeus SDK
const amadeus = new Amadeus({
  clientId:     process.env.AMADEUS_KEY,
  clientSecret: process.env.AMADEUS_SECRET,
});

// get hotels by city code
export async function fetchHotels(cityCode = 'PAR') {
  const res = await amadeus.referenceData.locations.hotels.byCity.get({
    cityCode,
  });
  return res.data;   // [{ hotelId, name, latitude, longitude }]
}

// hotel photo & rating
export async function fetchHotelDetails(hotelIds: string[]) {
  const photoMap: Record<string, string> = {};
  const ratingMap: Record<string, string> = {};

  hotelIds.forEach(id => (ratingMap[id] = '—'));

  const photosEP = amadeus.referenceData?.locations?.hotels?.photos;

  if (photosEP && typeof photosEP.get === 'function') {
    try {
      const res = await photosEP.get({
        hotelIds: hotelIds.slice(0, 20).join(','), // API limit 20 hotel id
      });
      res.data.forEach((p: any) => {
        const url = p.photos?.[0]?.url;
        if (url) photoMap[p.hotelId] = url;
      });
    } catch {
      console.warn('Photos endpoint failed, 繼續無圖');
    }
  } else {
    console.warn('Photos API not available on this Amadeus plan');
  }

  return { photoMap, ratingMap };
}

// search city
export async function searchCities(keyword: string) {
  const res = await amadeus.referenceData.locations.get({
    keyword,
    subType: 'CITY',
  });
  return res.data;
}
