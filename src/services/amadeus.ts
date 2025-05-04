import 'dotenv/config';
import Amadeus from 'amadeus';

const amadeus = new Amadeus({
  clientId:     process.env.AMADEUS_KEY,
  clientSecret: process.env.AMADEUS_SECRET,
});

export async function fetchHotels(cityCode = 'PAR') {
  const res = await amadeus.referenceData.locations.hotels.byCity.get({
    cityCode,
  });
  return res.data; // [{ hotelId, name, latitude, longitude }]
}

export async function fetchHotelDetails(hotelIds: string[]) {
  const photoMap: Record<string, string> = {};
  const ratingMap: Record<string, string> = {};

  hotelIds.forEach(id => (ratingMap[id] = '—')); // Sandbox 沒星級

  const photosEndpoint =
    amadeus.referenceData?.locations?.hotels?.photos;

  if (photosEndpoint && typeof photosEndpoint.get === 'function') {
    try {
      const res = await photosEndpoint.get({
        hotelIds: hotelIds.slice(0, 20).join(','),
      });
      res.data.forEach((p: any) => {
        const url = p.photos?.[0]?.url;
        if (url) photoMap[p.hotelId] = url;
      });
    } catch (e) {
      console.warn('Photos endpoint failed, continue without images');
    }
  } else {
    console.warn('Photos API not available on this Amadeus plan');
  }

  return { photoMap, ratingMap };
}
